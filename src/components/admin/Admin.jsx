import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUsuarios } from "../../hooks/useUsuarios";
import { usePeticionesAdmin } from "./UsePeticionesAdmin";
import PantallaCarga from "../layout/PantallaCarga";
import { useState } from "react";
import PantallaPeticiones from "./PantallaPeticiones";
import { bulk_aprobarPeticiones, bulk_eliminarPeticiones } from "../../services/peticiones.service";
import ModalInvitar from "./ModalInvitar";

export default function Admin() {
    const { user, rolActual, empresaActivaId, empresas, cargando: cargandoAuth } = useAuth();
    const { usuarios, cargando: cargandoUsuarios, eliminarUsuario } = useUsuarios(empresaActivaId);
    const { peticiones, total: totalPeticiones } = usePeticionesAdmin(empresaActivaId);
    const [mostrarPeticiones, setMostrarPeticiones] = useState(false);
    const [mostrarInvitar, setMostrarInvitar] = useState(false);

    if (cargandoAuth) return <PantallaCarga />;

    if (!user || rolActual !== "admin") {
        alert("No tienes permiso para ver esta página.");
        return <Navigate to="/" replace />;
    }

    if (cargandoUsuarios) return <PantallaCarga />;

    const nombreEmpresa = empresas.find((e) => e.id === empresaActivaId)?.nombre || "";

    const handleEliminar = (u) => {
        if (window.confirm(`¿Eliminar a ${u.nombre}?`)) eliminarUsuario(u.id);
    };

    return (
        <div className="Pantalla-admin-principal">
            <div className="admin-toolbar">
                <h2 className="titulo-pantalla">Equipo</h2>
                <button onClick={() => setMostrarPeticiones(true)} className="btn btn-glass boton-peticiones">
                    Peticiones <span className="badge">{totalPeticiones}</span>
                </button>
            </div>

            {mostrarPeticiones && (
                <PantallaPeticiones
                    peticiones={peticiones}
                    cerrar={() => setMostrarPeticiones(false)}
                    onAceptar={(peticion) => bulk_aprobarPeticiones(empresaActivaId, [peticion])}
                    onEliminar={(peticionId) => bulk_eliminarPeticiones(empresaActivaId, [peticionId])}
                    onAceptarTodas={(todas) => bulk_aprobarPeticiones(empresaActivaId, todas)}
                    onEliminarTodas={(todas) => bulk_eliminarPeticiones(empresaActivaId, todas.map((p) => p.id))}
                />
            )}

            <div className="grid-boxes">
                {usuarios
                    .filter((u) => u.rol === "usuario")
                    .filter((u) => u.activo !== false)
                    .map((u) => (
                        <article key={u.id} className="box box-usuario glass">
                            <Link to={`/empresas/${empresaActivaId}/admin/verHoras/${u.id}`} className="box-link">
                                <div className="box-avatar">{u.nombre?.[0]}</div>
                                <strong>{u.nombre}</strong>
                                {u.email && <small>{u.email}</small>}
                            </Link>
                            <button className="box-eliminar" onClick={() => handleEliminar(u)}
                                aria-label={`Eliminar a ${u.nombre}`} title="Eliminar">
                                ✖
                            </button>
                        </article>
                    ))}

                <button className="box box-agregar" onClick={() => setMostrarInvitar(true)}>
                    <span className="mas">+</span>
                    <strong>Agregar usuario</strong>
                </button>
            </div>

            {mostrarInvitar && (
                <ModalInvitar empresaId={empresaActivaId} nombreEmpresa={nombreEmpresa}
                    uid={user.uid} cerrar={() => setMostrarInvitar(false)} />
            )}
        </div>
    );
}