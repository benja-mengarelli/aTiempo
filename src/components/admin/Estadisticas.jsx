import PantallaCarga from "../layout/PantallaCarga";
import IntensidadDias from "../graficos/IntensidadDias";
import HorasPorEmpleado from "../graficos/HorasPorEmpleado";
import TotalHorasEmpleado from "../graficos/TotalHorasEmpleados"
import EquilibrioCarga from "../graficos/EquilibrioCarga";
import { horasFiltradas } from "../../helpers/jornada.helpers";

export function Estadisticad() {

    const { jornadas, cargando: cargandoDashboard, meses, mes, setMes } = useDashboardAdmin(usuarios, empresaActivaId);
    const filtradas = horasFiltradas(jornadas, mes);

    return (
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
    )
}