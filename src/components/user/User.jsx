import { use, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { distanciaEntreCoordenadas, formatearTiempo, obtenerTiempoActualEnSegundos  }  from "../../helpers/time.helpers";

const COORDENADAS_CLUB = {
    latitud: -31.369203,
    longitud: -64.240521
};

const DISTANCIA_MAX = 300; // en metros

export default function User() {
    const { user } = useAuth();
    const [inicioTs, setInicioTs] = useState(
        localStorage.getItem("inicioTs")
            ? Number(localStorage.getItem("inicioTs"))
            : null
    );

    const [tiempo, setTiempo] = useState(0);
    const [distancia, setDistancia] = useState(null);


    // Actualizar el tiempo transcurrido cada segundo // Se reinicia al cambiar inicioTs(cambio jornada)
    useEffect(() => {
        if (!inicioTs) return;

        const intervalo = setInterval(() => {
            setTiempo(Date.now() - inicioTs);
        }, 1000);

        return () => clearInterval(intervalo);
    }, [inicioTs]);

    // obtener ubicacion y calcular distancia
    const obtenerUbicacion = () => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {enableHighAccuracy: true});
        });
    };

    // Iniciar jornada
    const iniciarJornada = async () => {
        const ts = Date.now();
        setInicioTs(ts);
        localStorage.setItem("inicioTs", ts);
        const pos = await obtenerUbicacion();
        const distanciaActual = distanciaEntreCoordenadas(
            pos.coords.latitude,
            pos.coords.longitude,
            COORDENADAS_CLUB.latitud,
            COORDENADAS_CLUB.longitud
        );
        
        const flagDistancia = distanciaActual > DISTANCIA_MAX ? "1" : "0";
        localStorage.setItem("flagDistancia", flagDistancia);
    };

    // Finalizar jornada
    const finalizarJornada = async () => {
        const finTs = Date.now();
        const pos = await obtenerUbicacion();
        const distanciaActual = distanciaEntreCoordenadas(
            pos.coords.latitude,
            pos.coords.longitude,
            COORDENADAS_CLUB.latitud,
            COORDENADAS_CLUB.longitud
        );
        let contadorUbicacion = Number(localStorage.getItem("flagDistancia") || 0);
        contadorUbicacion = distanciaActual > DISTANCIA_MAX ? contadorUbicacion + 1 : contadorUbicacion;
        const mensaje = contadorUbicacion > 0 ? `Atención: Se ha registrado una distancia fuera del rango permitido (${DISTANCIA_MAX}m) en ${contadorUbicacion} ocasión(es).` : "Registro Correcto";

        // Guardar en Firestore
        try {
            console.log(user?.uid);
            await addDoc(collection(db, "users", user.uid, "jornadas"), {
                fecha: new Date(inicioTs).toISOString().slice(0,10),
                inicio: new Date(inicioTs).toLocaleTimeString(),
                fin: new Date(finTs).toLocaleTimeString(),
                duracion: formatearTiempo(Math.floor((finTs - inicioTs) / 1000)),
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
    };

    return (
        <div>
            <p>Bienvenido al panel de usuario. Aquí puedes ver y gestionar tu información personal.</p>
            <button onClick={inicioTs? finalizarJornada : iniciarJornada}>
                {inicioTs ? "Finalizar Jornada" : "Iniciar Jornada"}
            </button>
        
            <p>
                {inicioTs ? obtenerTiempoActualEnSegundos(inicioTs) : "00:00:00"}
            </p>

        </div>

        
    );
}