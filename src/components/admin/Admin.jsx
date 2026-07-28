import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import PantallaCarga from "../layout/PantallaCarga";
import { useUsuarios } from "../../hooks/useUsuarios";
import { Timestamp } from "firebase/firestore";
import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import {horasFiltradas } from "../../helpers/jornada.helpers";
import { useDashboardAdmin } from "../../hooks/useDashboardAdmin";
import IntensidadDias from "../graficos/IntensidadDias";
import HorasPorEmpleado from "../graficos/HorasPorEmpleado";
import TotalHorasEmpleado from "../graficos/TotalHorasEmpleados"


export function Admin({ datos }) {
    const { user } = useAuth();
    const { usuarios, cargando: cargandoUsuarios, eliminarUsuario } = useUsuarios();
    const { jornadas, cargando: cargandoDashboard, meses, mes, setMes } = useDashboardAdmin(usuarios);
    const filtradas = horasFiltradas(jornadas, mes);

    if (!user || datos?.rol !== "admin") {
        alert("No tienes permiso para ver esta página.");
        return <Navigate to="/" replace />;
    }

    if (cargandoUsuarios || cargandoDashboard) return <PantallaCarga />;


    return (
        <div className="Pantalla-admin-principal">
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
            <div className="dashboard-graficos-admin">
                <div className="visualizacion-fechas">
                    {meses.map(m => (
                        <button
                            key={m.value}
                            onClick={() => setMes(m.value)}
                            style={{
                                backgroundColor: mes === m.value ? "var(--primario)" : "#ddd",
                                color: mes === m.value ? "white" : "black",
                                transform: mes === m.value ? "scale(1.1)" : "none",
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
                <IntensidadDias jornadas={filtradas} />
                <TotalHorasEmpleado jornadas={filtradas} />
                <HorasPorEmpleado jornadas={filtradas} />
            </div>
        </div>
    );
}