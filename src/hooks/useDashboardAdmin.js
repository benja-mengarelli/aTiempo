import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { getMesesDisponibles } from "../helpers/jornada.helpers";

export function useDashboardAdmin(usuarios) {

    const FECHA_INICIO = new Date('2026-01-01');
    const meses = getMesesDisponibles(FECHA_INICIO);
    const [mes, setMes ] = useState((meses[0] && meses[0].value) || '');

    const [jornadas, setJornadas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        if (!usuarios.length) {
            setCargando(false);
            return;
        }

        async function cargar() {

            setCargando(true);

            try {

                const resultados = await Promise.all(

                    usuarios
                        .filter(u => u.activo)
                        .filter(u => u.rol == "usuario")
                        .map(async usuario => {

                            const snapshot = await getDocs(
                                collection(db, "users", usuario.id, "jornadas")
                            );

                            return snapshot.docs.map(doc => ({
                                id: doc.id,
                                ref: doc.ref,
                                ...doc.data(),
                                uid: usuario.id,
                                nombre: usuario.nombre,
                                apellido: usuario.apellido,
                                rol: usuario.rol
                            }));

                        })

                );
                const jornadas = resultados.flat();

                const ahora = Date.now();

                const vencidas = jornadas.filter( j => j.expiracion?.toMillis() < ahora);

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

    }, [usuarios]);

    return {
        jornadas,
        cargando,
        error,
        meses, 
        mes,
        setMes
    };

}