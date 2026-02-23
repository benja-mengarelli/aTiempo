import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { formatearTiempo, obtenerTiempoActualEnSegundos, contabilizarHoras } from "../../helpers/time.helpers";
import useGeoLocation from "../../hooks/useGeoLocation";
import PantallaCarga from "../layout/PantallaCarga";

const COORDENADAS_CLUB = {
    latitud: -31.369203,
    longitud: -64.240521
};

export default function User() {
    const { user } = useAuth();
    const { flagDistancia, verificarDistancia } = useGeoLocation(COORDENADAS_CLUB);
    const [cargando, setCargando] = useState(false)
    const [tiempo, setTiempo] = useState(0);

    //! Cambiar por objeto en forage
    const [inicioTs, setInicioTs] = useState(
        localStorage.getItem("inicioTs")
            ? Number(localStorage.getItem("inicioTs"))
            : null
    );

    // Actualizar el tiempo transcurrido cada segundo // Se reinicia al cambiar inicioTs(cambio jornada)
    useEffect(() => {
        if (!inicioTs) return;

        const intervalo = setInterval(() => {
            setTiempo(Date.now() - inicioTs);
        }, 1000);

        return () => clearInterval(intervalo);
    }, [inicioTs]);

    // Iniciar jornada
    const iniciarJornada = async () => {
        const ts = Date.now();
        setInicioTs(ts);
        //! Guardar en storage, cambiar por forage
        localStorage.setItem("inicioTs", ts);

        // obtener ubicacion y verificar geolocation
        const flag = await verificarDistancia();
        //! Guardar en storage, cambiar por forage
        localStorage.setItem("flagDistancia", flag);
    };

    // Finalizar jornada
    const finalizarJornada = async () => {
        setCargando(true);

        const finTs = Date.now();
        // obtener ubicacion y verificar geolocation
        const flag = await verificarDistancia();
        // traer contador de ubicacion fuera de rango y sumarle el actual
        let contadorUbicacion = Number(localStorage.getItem("flagDistancia") || 0) + Number(flag || 0);
        const mensaje = contadorUbicacion > 2 ? `Ubicacion no permitida` : contadorUbicacion > 0 ? `Fuera de rango en ${contadorUbicacion} ocasión(es).` : "ubicacion correcta";

        // Guardar en Firestore
        try {
            await addDoc(collection(db, "users", user.uid, "jornadas"), {
                fecha: new Date(inicioTs).toISOString().slice(0, 10),
                inicio: new Date(inicioTs).toLocaleTimeString(),
                fin: new Date(finTs).toLocaleTimeString(),
                duracion: contabilizarHoras((finTs - inicioTs) / 1000),
                mensaje: mensaje
            });
            // Resetear estado
            setInicioTs(null);
            setTiempo(0);
            localStorage.removeItem("inicioTs");
            localStorage.removeItem("flagDistancia");
        }
        catch (e) {
            alert("Error al guardar la jornada: " + e.message);
        }
        finally {
            setCargando(false)
        }
    };

    if (cargando) return <PantallaCarga />

    return (
        <div className="circulo-jornada">
            <h2>{inicioTs ? "Jornada corriendo" : "Iniciar jornada"}</h2>
            <button onClick={inicioTs ? finalizarJornada : iniciarJornada} disabled={cargando}>
                {inicioTs ? "Finalizar ⏸️" : "Iniciar ▶️"}
            </button>
            <p>
                {inicioTs ? obtenerTiempoActualEnSegundos(inicioTs) : "00:00:00"}
            </p>

        </div>


    );
}