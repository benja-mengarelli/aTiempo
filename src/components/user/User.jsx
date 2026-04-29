import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { collection, addDoc, query, updateDoc, doc, Timestamp, where, orderBy, limit, getDocs } from "firebase/firestore";
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
        const expiracion = new Date();
        expiracion.setMonth(expiracion.getMonth() + 7);
        expiracion.setDate(1);

        // Hacer guardado en fb
        setCargando(true);
        const flag = await verificarDistancia();
        try {
            const docref = await addDoc(collection(db, "users", user.uid, "jornadas"), {
                fecha: new Date(ts).toISOString().slice(0, 10),
                inicio: new Date(ts).toLocaleTimeString(),
                fin: null,
                duracion: null,
                mensaje: null,
                activo: true,
                expiracion: Timestamp.fromDate(expiracion)
            });
            localStorage.setItem("inicioTs", ts);
            localStorage.setItem("flagDistancia", flag);
            localStorage.setItem("jornadaId", docref.id);
            console.log("Jornada iniciada con ID:", docref.id);

        } catch (e) {
            alert("Error al iniciar la jornada: " + e.message);
            setInicioTs(null);
            localStorage.removeItem("inicioTs");
            localStorage.removeItem("flagDistancia");
            localStorage.removeItem("jornadaId");
            console.log("Error al iniciar jornada:", e);

        } finally {
            setCargando(false);
        }
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
            const jornadaId = localStorage.getItem("jornadaId");
            console.log("Finalizando jornada con ID:", jornadaId);
            if (!jornadaId) {
                const q = query(collection(db, "users", user.uid, "jornadas"), where("activo", "==", true), orderBy("inicio", "desc"), limit(1));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    //limpiar estado corrupto
                    setInicioTs(null);
                    localStorage.removeItem("inicioTs");
                    localStorage.removeItem("flagDistancia");
                    localStorage.removeItem("jornadaId");
                    alert("No se encontró una jornada activa para finalizar. Se ha reseteado el estado. Por favor, intenta iniciar y finalizar la jornada nuevamente.");
                    throw new Error("No se encontró una jornada activa para finalizar.");

                }
                const doc = querySnapshot.docs[0];
                await updateDoc(doc.ref, {
                    fin: new Date(finTs).toLocaleTimeString(),
                    duracion: contabilizarHoras((finTs - inicioTs) / 1000),
                    mensaje: mensaje,
                    activo: false
                });
            } else {
                const docRef = doc(db, "users", user.uid, "jornadas", jornadaId);
                await updateDoc(docRef, {
                    fin: new Date(finTs).toLocaleTimeString(),
                    duracion: contabilizarHoras((finTs - inicioTs) / 1000),
                    mensaje: mensaje,
                    activo: false
                });
            }            
            
            // Resetear estado
            setInicioTs(null);
            setTiempo(0);
            localStorage.removeItem("inicioTs");
            localStorage.removeItem("flagDistancia");
            localStorage.removeItem("jornadaId");
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