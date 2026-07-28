import {

    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend

} from "recharts";
import GraficoCard from "../layout/GraficoCard";
import { horasPorEmpleado } from "../../helpers/metricas";

export default function HorasPorEmpleado({ jornadas }) {

    const data = horasPorEmpleado(jornadas);

    const empleados = [
        ...new Set(
            jornadas.map(j => j.nombre || j.user)
        )
    ];

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

    return (
        <GraficoCard titulo="🕜 Horas por empleado">
            <ResponsiveContainer width="100%" height={350}>

                <BarChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="dia" />

                    <YAxis
                        label={{
                            value: "Horas",
                            angle: -90,
                            position: "insideLeft"
                        }}
                    />

                    <Tooltip />

                    <Legend />

                    {

                        empleados.map((nombre, index) => (

                            <Bar
                                key={nombre}
                                dataKey={nombre}
                                stackId="a"
                                fill={COLORES[index % COLORES.length]}
                                radius={[4, 4, 0, 0]}
                                animationDuration={700}
                            />

                        ))

                    }

                </BarChart>

            </ResponsiveContainer>

        </GraficoCard>

    );

}