import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { collection, setDoc, query, updateDoc, doc, Timestamp, where, orderBy, limit, getDocs } from "firebase/firestore";
import { formatearTiempo, obtenerTiempoActualEnSegundos, contabilizarHoras } from "../../helpers/time.helpers";
import useGeoLocation from "../../hooks/useGeoLocation";
import PantallaCarga from "../layout/PantallaCarga";

const COORDENADAS_CLUB = {
    latitud: -31.369203,
    longitud: -64.240521
};

export default function User() {
    const { user, empresaActivaId, cargando: cargandoAuth } = useAuth();
    const { flagDistancia, verificarDistancia } = useGeoLocation(COORDENADAS_CLUB);
    const [cargando, setCargando] = useState(false)
    const [tiempo, setTiempo] = useState(0);
    const [inicioTs, setInicioTs] = useState(
        localStorage.getItem("inicioTs")
            ? Number(localStorage.getItem("inicioTs"))
            : null
    );

    if (cargandoAuth) return <PantallaCarga />;

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

        if (!empresaActivaId) {
            alert("No pertenecés a ninguna empresa todavía.");
            return;
        }

        const ts = Date.now();
        setInicioTs(ts);
        const expiracion = new Date();
        expiracion.setMonth(expiracion.getMonth() + 6);
        expiracion.setDate(1);

        // Hacer guardado en fb
        setCargando(true);
        const flag = await verificarDistancia();

        const payload = {
            fecha: new Date(ts).toLocaleDateString("sv-SE", { timeZone: "America/Argentina/Cordoba" }),
            diaSemana: new Date(ts).toLocaleDateString("es-AR", { weekday: "long", timeZone: "America/Argentina/Cordoba" }),
            numeroDia: new Date(ts).getDate(),
            numeroDiaSemana: new Date(ts).getDay(),
            inicio: new Date(ts).toLocaleTimeString(),
            fin: null,
            duracion: null,
            mensaje: null,
            activo: true,
            expiracion: Timestamp.fromDate(expiracion),
            uid: user.uid,
        };

        try {
            const nuevoDoc = doc(collection(db, "empresas", empresaActivaId, "jornadas"));
            await setDoc(nuevoDoc, payload);

            localStorage.setItem("inicioTs", ts);
            localStorage.setItem("flagDistancia", flag);
            localStorage.setItem("jornadaId", nuevoDoc.id);
            console.log("Jornada iniciada con ID:", nuevoDoc.id);

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

        if (!empresaActivaId) {
            alert("No pertenecés a ninguna empresa todavía.");
            return;
        }

        setCargando(true);

        const finTs = Date.now();
        const flag = await verificarDistancia();
        let contadorUbicacion = Number(localStorage.getItem("flagDistancia") || 0) + Number(flag || 0);
        const mensaje = contadorUbicacion > 2 ? `Ubicacion no permitida` : contadorUbicacion > 0 ? `Fuera de rango en ${contadorUbicacion} ocasión(es).` : "ubicacion correcta";

        // Guardar en Firestore
        try {
            let jornadaId = localStorage.getItem("jornadaId");

            if (!jornadaId) {

                const q = query(
                    collection(db, "empresas", empresaActivaId, "jornadas"),
                    where("uid", "==", user.uid),
                    where("activo", "==", true),
                    orderBy("inicio", "desc"),
                    limit(1)
                );

                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setInicioTs(null);
                    localStorage.removeItem("inicioTs");
                    localStorage.removeItem("flagDistancia");
                    localStorage.removeItem("jornadaId");
                    alert("No se encontró una jornada activa para finalizar. Se ha reseteado el estado.");
                    throw new Error("No se encontró una jornada activa para finalizar.");
                }
                jornadaId = querySnapshot.docs[0].id;
            }

            const payload = {
                fin: new Date(finTs).toLocaleTimeString(),
                duracion: contabilizarHoras((finTs - inicioTs) / 1000),
                mensaje: mensaje,
                activo: false,
            };

            await updateDoc(doc(db, "empresas", empresaActivaId, "jornadas", jornadaId), payload);

            setInicioTs(null);
            setTiempo(0);
            localStorage.removeItem("inicioTs");
            localStorage.removeItem("flagDistancia");
            localStorage.removeItem("jornadaId");

        }
        catch (e) {
            alert("Error al guardar la jornada: " + e.message);
            setInicioTs(null);
            setTiempo(0);
            localStorage.removeItem("inicioTs");
            localStorage.removeItem("flagDistancia");
            localStorage.removeItem("jornadaId");
            console.log("Error al finalizar jornada:", e);
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