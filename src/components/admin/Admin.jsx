import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import PantallaCarga from "../layout/PantallaCarga";
import { useUsuarios } from "../../hooks/useUsuarios";
import { Timestamp } from "firebase/firestore";
import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";


export function Admin({ datos }) {
    const { user } = useAuth();
    const { usuarios, cargando, eliminarUsuario } = useUsuarios();

    if (!user || datos?.rol !== "admin") {
        alert("No tienes permiso para ver esta página.");
        return <Navigate to="/" replace />;
    }

    if (cargando) return <PantallaCarga />;

    return (
        <div className="lista-usuarios">
            {usuarios
                .filter(u => u.rol === "usuario")
                .filter(u => u.activo !== false)
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
    );
}