import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { getMesesDisponibles } from "../helpers/jornada.helpers";

export function useDashboardAdmin(usuarios, empresaId) {

    const FECHA_INICIO = new Date('2026-01-01');
    const meses = getMesesDisponibles(FECHA_INICIO);
    const [mes, setMes] = useState((meses[0] && meses[0].value) || '');

    const [jornadas, setJornadas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        if (!usuarios.length || !empresaId) {
            setCargando(false);
            return;
        }

        async function cargar() {
            setCargando(true);
            try {
                // Mapa uid -> usuario, para pegarle nombre/apellido/rol en memoria
                // (reemplaza el .map() que antes hacía 1 query por usuario)
                const usuariosPorId = new Map(
                    usuarios
                        .filter(u => u.activo)
                        .filter(u => u.rol === "usuario")
                        .map(u => [u.id, u])
                );

                // UNA sola lectura para TODA la empresa
                const snapshot = await getDocs(
                    collection(db, "empresas", empresaId, "jornadas")
                );

                const jornadas = snapshot.docs
                    .map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() }))
                    .filter(j => usuariosPorId.has(j.uid)) // solo activos con rol "usuario"
                    .map(j => {
                        const usuario = usuariosPorId.get(j.uid);
                        return {
                            ...j,
                            nombre: usuario.nombre,
                            rol: usuario.rol,
                        };
                    });

                const ahora = Date.now();

                const vencidas = jornadas.filter(j => j.expiracion?.toMillis() < ahora);

                await Promise.all(vencidas.map(j => deleteDoc(j.ref)));

                setJornadas(jornadas);
            }
            catch (e) {
                console.error(e);
                setError("No se pudieron cargar las jornadas.");
            }
            finally {
                setCargando(false);
            }
        }
        cargar();

    }, [usuarios, empresaId]);

    return {
        jornadas,
        cargando,
        error,
        meses,
        mes,
        setMes
    };
}