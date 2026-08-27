import { useEffect, useState } from "react";
import { getUsuarios, desactivarUsuario } from "../services/usuarios.service";

export function useUsuarios(empresaId) {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!empresaId) {
            setUsuarios([]);
            setCargando(false);
            return;
        }

        async function cargar() {
            setCargando(true);
            try {
                const data = await getUsuarios(empresaId);
                setUsuarios(data);
            } catch (e) {
                setError("No se pudieron cargar los usuarios")
            } finally {
                setCargando(false)
            }
        }

        cargar();
    }, [empresaId]);

    const eliminarUsuario = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;

        try {
            await desactivarUsuario(id, empresaId);
            // Ahora es una baja real de la empresa (no un flag): lo sacamos del listado.
            setUsuarios(prev => prev.filter(u => u.id !== id));
        } catch (e) {
            alert("Error al eliminar el usuario")
        }
    };

    return {
        usuarios,
        cargando,
        eliminarUsuario,
        error
    };
}