import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase"; 

/**
 * Todas las peticiones pendientes de la empresa (no solo las de un usuario).
 * Usada para el badge de notificación y la pantalla de revisión del admin.
 */
export function usePeticionesAdmin(empresaId) {
    const [peticiones, setPeticiones] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (!empresaId) {
            setPeticiones([]);
            setCargando(false);
            return;
        }

        setCargando(true);
        const q = query(
            collection(db, "empresas", empresaId, "peticiones"),
        );

        const unsub = onSnapshot(
            q,
            (snap) => {
                setPeticiones(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setCargando(false);
            },
            (err) => {
                console.error("Error escuchando peticiones de la empresa:", err);
                setPeticiones([]);
                setCargando(false);
            }
        );

        return () => unsub();
    }, [empresaId]);

    return { peticiones, cargando, total: peticiones.length };
}