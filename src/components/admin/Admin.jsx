import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUsuarios } from "../../hooks/useUsuarios";
import { usePeticionesAdmin } from "./UsePeticionesAdmin";
import PantallaCarga from "../layout/PantallaCarga";
import { useState } from "react";
import PantallaPeticiones from "./PantallaPeticiones";
import { bulk_aprobarPeticiones, bulk_eliminarPeticiones } from "../../services/peticiones.service";


import {
    collection,
    getDocs,
    doc,
    setDoc,
    writeBatch
} from "firebase/firestore";
import { db } from "../../services/firebase";





export function Admin() {
    const { user, rolActual, empresaActivaId, cargando: cargandoAuth } = useAuth();
    const { usuarios, cargando: cargandoUsuarios, eliminarUsuario } = useUsuarios(empresaActivaId);
    const { peticiones, total: totalPeticiones } = usePeticionesAdmin(empresaActivaId);
    const [mostrarPeticiones, setMostrarPeticiones] = useState(false);

    if (cargandoAuth) return <PantallaCarga />;

    if (!user || rolActual !== "admin") {
        alert("No tienes permiso para ver esta página.");
        return <Navigate to="/" replace />;
    }

    if (cargandoUsuarios) return <PantallaCarga />;

    return (
        <div className="Pantalla-admin-principal">

            <button onClick={() => setMostrarPeticiones(true)} className="boton-peticiones">
                Peticiones<span className="badge">{totalPeticiones}</span>
            </button>
            {mostrarPeticiones && (
                <PantallaPeticiones
                    peticiones={peticiones}
                    cerrar={() => setMostrarPeticiones(false)}
                    onAceptar={(peticion) => bulk_aprobarPeticiones(empresaActivaId, [peticion])}
                    onEliminar={(peticionId) => bulk_eliminarPeticiones(empresaActivaId, [peticionId])}
                    onAceptarTodas={(todas) => bulk_aprobarPeticiones(empresaActivaId, todas)}
                    onEliminarTodas={(todas) => bulk_eliminarPeticiones(empresaActivaId, todas.map(p => p.id))}
                />
            )}
            <div className="lista-usuarios">
                {usuarios
                    .filter(u => u.rol === "usuario")
                    .filter(u => u.activo !== false) //! Ya no haria falta el filtro
                    .map((u) => (
                        <div key={u.id} className="usuario-card">
                            <Link to={`/admin/${u.id}`} className="usuario-item" >
                                <img src={u.imagen} alt={u.nombre} />
                            </Link>

                            <h3>{u.nombre}</h3>

                            <button className="eliminar-usuario" onClick={() => eliminarUsuario(u.id)}>⛔</button>
                        </div>
                    ))}
            </div>
        </div>
    );
}