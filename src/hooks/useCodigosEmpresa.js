import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase"; // ajustar al path real

// Códigos de "unirse" generados por el admin para UNA empresa puntual.
export function useCodigosEmpresa(empresaId) {
    const [codigos, setCodigos] = useState([]);

    useEffect(() => {
        if (!empresaId) {
            setCodigos([]);
            return;
        }

        const ref = collection(db, "empresas", empresaId, "codigosInvitacion");
        const unsub = onSnapshot(
            ref,
            (snap) => setCodigos(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => console.error("Error escuchando códigos de la empresa:", err)
        );

        return () => unsub();
    }, [empresaId]);

    return { codigos };
}
