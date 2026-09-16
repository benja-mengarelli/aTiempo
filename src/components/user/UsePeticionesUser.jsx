import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";

/**
 * Reemplaza el useEffect con getUserPeticiones - en vez de traer una foto
 * fija, se suscribe. Se actualiza solo apenas se crea/aprueba/rechaza una
 * petición, sin necesidad de refrescar manualmente desde ningún form.
 */
export function usePeticionesUsuario(empresaId, userId) {
    const [peticiones, setPeticiones] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (!empresaId || !userId) {
            setPeticiones([]);
            setCargando(false);
            return;
        }

        setCargando(true);
        const q = query(
            collection(db, "empresas", empresaId, "peticiones"),
            where("uid", "==", userId),
        );

        const unsub = onSnapshot(
            q,
            (snap) => {
                setPeticiones(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setCargando(false);
            },
            (err) => {
                console.error("Error escuchando peticiones del usuario:", err);
                setPeticiones([]);
                setCargando(false);
            }
        );

        return () => unsub();
    }, [empresaId, userId]);

    const contarPorTipo = (tipo) => peticiones.filter((p) => p.tipo === tipo).length;

    return { peticiones, cargando, total: peticiones.length, contarPorTipo };
}