import { createContext, useContext, useState, useEffect } from "react";
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";
import useGeoLocation from "../hooks/useGeoLocation";
import { contabilizarHoras } from "../helpers/time.helpers";

const COORDENADAS_CLUB = {
    latitud: -31.369203,
    longitud: -64.240521
};

const JornadaActivaContext = createContext();

export const JornadaActivaProvider = ({ children }) => {
    const { user, empresaActivaId } = useAuth();
    const { verificarDistancia } = useGeoLocation(COORDENADAS_CLUB);

    const [jornadaActiva, setJornadaActiva] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        if (!user || !empresaActivaId) {
            setJornadaActiva(null);
            setCargando(false);
            return;
        }

        setCargando(true);
        const q = query(
            collection(db, "empresas", empresaActivaId, "jornadas"),
            where("uid", "==", user.uid),
            where("activo", "==", true),
            orderBy("inicio", "desc"),
            limit(1)
        );

        const unsub = onSnapshot(
            q,
            (snap) => {
                setJornadaActiva(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
                setCargando(false);
            },
            (err) => {
                console.error("Error escuchando jornada activa:", err);
                setJornadaActiva(null);
                setCargando(false);
            }
        );

        return () => unsub();
    }, [user, empresaActivaId]);

    const iniciarJornada = async () => {
        if (!user || !empresaActivaId) {
            alert("No pertenecés a ninguna empresa todavía.");
            return;
        }
        if (jornadaActiva) {
            // no hace falta volver
            // a preguntarle a Firestore si hay una activa.
            alert("Ya tenés una jornada activa.");
            return;
        }

        setProcesando(true);
        try {
            const flagInicio = await verificarDistancia();
            const ts = Date.now();
            const expiracion = new Date();
            expiracion.setMonth(expiracion.getMonth() + 6);
            expiracion.setDate(1);

            const payload = {
                fecha: new Date(ts).toLocaleDateString("sv-SE", { timeZone: "America/Argentina/Cordoba" }),
                diaSemana: new Date(ts).toLocaleDateString("es-AR", { weekday: "long", timeZone: "America/Argentina/Cordoba" }),
                numeroDia: new Date(ts).getDate(),
                numeroDiaSemana: new Date(ts).getDay(),
                inicio: new Date(ts).toLocaleTimeString(),
                inicioTimestamp: Timestamp.fromMillis(ts),
                fin: null,
                duracion: null,
                mensaje: null,
                activo: true,
                flagDistanciaInicio: flagInicio || 0,
                expiracion: Timestamp.fromDate(expiracion),
                uid: user.uid,
            };

            const nuevoDoc = doc(collection(db, "empresas", empresaActivaId, "jornadas"));
            await setDoc(nuevoDoc, payload);

        } catch (e) {
            alert("Error al iniciar la jornada: " + e.message);
            console.error("Error al iniciar jornada:", e);
        } finally {
            setProcesando(false);
        }
    };

    const finalizarJornada = async () => {
        if (!user || !empresaActivaId) {
            alert("No pertenecés a ninguna empresa todavía.");
            return;
        }

        if (!jornadaActiva) {
            alert("No hay ninguna jornada activa para finalizar.");
            return;
        }

        setProcesando(true);
        try {
            const finTs = Date.now();
            const flagFin = await verificarDistancia();
            const contadorUbicacion = Number(jornadaActiva.flagDistanciaInicio || 0) + Number(flagFin || 0);
            const mensaje =
                contadorUbicacion > 2
                    ? "Ubicacion no permitida"
                    : contadorUbicacion > 0
                        ? `Fuera de rango en ${contadorUbicacion} ocasión(es).`
                        : "ubicacion correcta";

            // inicioTimestamp viene del propio doc: funciona sin importar
            // desde qué dispositivo se inició la jornada.
            const inicioReal = jornadaActiva.inicioTimestamp
                ? jornadaActiva.inicioTimestamp.toMillis()
                : finTs;

            const cambios = {
                fin: new Date(finTs).toLocaleTimeString(),
                duracion: contabilizarHoras((finTs - inicioReal) / 1000),
                mensaje,
                activo: false,
            };

            await updateDoc(doc(db, "empresas", empresaActivaId, "jornadas", jornadaActiva.id), cambios);
            // Ídem: el listener ve activo:false y pone jornadaActiva en null solo.
        } catch (e) {
            alert("Error al guardar la jornada: " + e.message);
            console.error("Error al finalizar jornada:", e);
        } finally {
            setProcesando(false);
        }
    };

    return (
        <JornadaActivaContext.Provider
            value={{ jornadaActiva, cargando, procesando, iniciarJornada, finalizarJornada }}
        >
            {children}
        </JornadaActivaContext.Provider>
    );
};

export const useJornadaActiva = () => useContext(JornadaActivaContext);
