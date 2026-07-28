import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    Cell
} from "recharts";

import GraficoCard from "../layout/GraficoCard";
import { totalHorasEmpleado } from "../../helpers/metricas";
import { formatearHorasDecimal } from "../../helpers/time.helpers";

const COLORES = [
    "#2563eb",
    "#22c55e",
    "#ef4444",
    "#f97316",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#ec4899",
    "#14b8a6",
    "#facc15",
];

export default function TotalHorasEmpleado({ jornadas }) {

    const data = totalHorasEmpleado(jornadas);
    const altura = 50 + data.length * 50; // Altura dinámica basada en la cantidad de empleados

    return (

        <GraficoCard titulo="🏆 Horas totales por empleado">
            <ResponsiveContainer width="100%" height={altura}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
                >

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        type="number"
                    />

                    <YAxis
                        type="category"
                        dataKey="nombre"
                        width={90}
                    />

                    <Tooltip
                        formatter={value => formatearHorasDecimal(value)}
                    />

                    <Bar
                        dataKey="horas"
                        radius={[0, 6, 6, 0]}
                    >
                        {
                            data.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORES[index % COLORES.length]}
                                />
                            ))
                        }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </GraficoCard>
    );
}