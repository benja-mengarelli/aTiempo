import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase"; // ajustar al path real

/**
 * Configuración de UNA empresa (coordenadas, rangoMetros, redondeoMinutos).
 * Atada a empresaId: si cambia, vuelve a pedirla. Mismo formato de retorno
 * que tendría un context, así promoverla a Provider después es mover este
 * cuerpo y los consumidores no cambian.
 *
 * !Ojo: cargando=false con configuracion=null puede ser "todavía no hay
 * !empresaId" o "la empresa no tiene config" - el hook no puede
 * !distinguirlos. La pantalla tiene que esperar también el cargando de auth.
 */
export function useConfiguracionEmpresa(empresaId) {
    const [configuracion, setConfiguracion] = useState(null);
    const [cargandoConfiguracion, setCargandoConfiguracion] = useState(true);

    useEffect(() => {
        if (!empresaId) {
            setConfiguracion(null);
            setCargandoConfiguracion(false);
            return;
        }

        let cancelado = false;
        setCargandoConfiguracion(true);

        getDoc(doc(db, "empresas", empresaId))
            .then((snap) => {
                if (!cancelado) setConfiguracion(snap.exists() ? snap.data() : null);
            })
            .catch((e) => {
                console.error("Error al cargar configuración de la empresa:", e);
                if (!cancelado) setConfiguracion(null);
            })
            .finally(() => {
                if (!cancelado) setCargandoConfiguracion(false);
            });

        return () => { cancelado = true; };
    }, [empresaId]);

    // Solo debería llamarla un admin - las reglas ya lo exigen del lado del
    // servidor (allow update en empresas/{id}); esto es el atajo del cliente.
    const actualizarConfiguracionEmpresa = async (cambios) => {
        if (!empresaId) throw new Error("No hay empresa activa.");
        await updateDoc(doc(db, "empresas", empresaId), cambios);
        setConfiguracion((prev) => ({ ...prev, ...cambios }));
    };

    return { configuracion, cargandoConfiguracion, actualizarConfiguracionEmpresa };
}