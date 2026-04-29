import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, setDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export function visualizarCodigosInvitacion(empresaId = "defaultEmpresaId") {
    const [codigos, setCodigos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        async function cargarCodigos() {
            try {
                const querySnapshot = await getDocs(collection(db, "codigosInvitacion"));
                const codigosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCodigos(codigosData);
                eliminarCodigovencido();

            } catch (e) {
                console.error("Error al cargar códigos de invitación:", e);
            }
            finally {
                setCargando(false);
            }
        }

        cargarCodigos();
    }, []);

    const eliminarCodigovencido = async () => {
        setCargando(true);
        try {
            const ahora = new Date();
            for (const codigo of codigos) {
                if (new Date(codigo.expiracion) < ahora) {
                    await deleteDoc(doc(db, "codigosInvitacion", codigo.id));
                    console.log("Código vencido eliminado:", codigo.id);
                    setCodigos(prev => prev.filter(c => c.id !== codigo.id));
                }
            }
        } catch (e) {
            console.error("Error al eliminar códigos vencidos:", e);
        }
        finally {
            setCargando(false);
        }
    };

    const generarCodigoInvitacion = async () => {
        setCargando(true);
        try {
            const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
            await setDoc(doc(db, "codigosInvitacion", codigo), {
                empresaId: empresaId,
                rol: "admin",
                usado: false,
                expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expira en 24 horas
            });
            setCodigos(prev => [...prev, { id: codigo, usado: false, expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }]);

            setCargando(false);
        } catch (e) {
            console.error("Error al generar código de invitación:", e);
            setCargando(false);
        }
    };

    return { codigos, cargando, generarCodigoInvitacion };
}