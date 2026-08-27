import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useDashboardAdmin } from "../../hooks/useDashboardAdmin";
import { horasFiltradas } from "../../helpers/jornada.helpers";
import PantallaCarga from "../layout/PantallaCarga";
import IntensidadDias from "../graficos/IntensidadDias";
import HorasPorEmpleado from "../graficos/HorasPorEmpleado";
import TotalHorasEmpleado from "../graficos/TotalHorasEmpleados"
import EquilibrioCarga from "../graficos/EquilibrioCarga";

export function Admin() {
    const { user, rolActual, empresaActivaId, cargando: cargandoAuth } = useAuth();
    const { usuarios, cargando: cargandoUsuarios, eliminarUsuario } = useUsuarios(empresaActivaId);
    const { jornadas, cargando: cargandoDashboard, meses, mes, setMes } = useDashboardAdmin(usuarios, empresaActivaId);
    const filtradas = horasFiltradas(jornadas, mes);

    console.log("Admin.jsx: usuarios", usuarios);
    console.log("admin.jsx", rolActual, empresaActivaId, cargandoAuth, cargandoUsuarios, cargandoDashboard);

    if (cargandoAuth) return <PantallaCarga />;
    


    if (!user || rolActual !== "admin") {
        alert("No tienes permiso para ver esta página.");
        return <Navigate to="/" replace />;
    }

    if (cargandoUsuarios || cargandoDashboard) return <PantallaCarga />;


    return (
        <div className="Pantalla-admin-principal">

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
                <TotalHorasEmpleado jornadas={filtradas} />
                <IntensidadDias jornadas={filtradas} />
                <EquilibrioCarga jornadas={filtradas} />
                <HorasPorEmpleado jornadas={filtradas} />
            </div>
        </div>
    );
}