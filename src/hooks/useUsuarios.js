//! Admin
import { useEffect, useState } from "react";
import { getUsuarios, desactivarUsuario } from "../services/usuarios.service";

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function cargar() {
            try {
                const data = await getUsuarios();
                setUsuarios(data);
            } catch (e) {
                setError("No se pudieron cargar los usuarios")
            } finally {
                setCargando(false)
            }
        }

        cargar();
    }, []);

    const eliminarUsuario = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;

        try {
            await desactivarUsuario(id);
            setUsuarios(prev =>
                prev.map(u => u.id === id ? { ...u, activo: false } : u)
            );
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