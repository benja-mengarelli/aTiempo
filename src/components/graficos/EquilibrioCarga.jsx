import {
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip

} from "recharts";
import GraficoCard from "../layout/GraficoCard";
import { coefficientVariation } from "../../helpers/metricas";

const ordenDias = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado"
];

export default function EquilibrioCarga({ jornadas }) {

    // Acumula horas por día y por empleado
    const dias = {};

    jornadas.forEach(j => {

        const dia = j.diaSemana.toLowerCase();

        if (!dias[dia]) dias[dia] = {};

        if (!dias[dia][j.uid]) dias[dia][j.uid] = 0;

        dias[dia][j.uid] += j.duracion || 0;

    });

    // Construye el dataset para Recharts
    const data = ordenDias
        .filter(dia => dias[dia])
        .map(dia => {

            const horasPorEmpleado = Object.values(dias[dia]);

            const cv = coefficientVariation(horasPorEmpleado);

            const equilibrio = Number(
                (Math.max(0, Math.min(100, (1 - cv) * 100))).toFixed(1)
            );

            return {
                dia: dia.charAt(0).toUpperCase() + dia.slice(1),
                equilibrio,
                empleados: horasPorEmpleado.length,
                horas: horasPorEmpleado.reduce((a, b) => a + b, 0)
            };
        });

    return (
        <GraficoCard titulo="⚖️ Equilibrio de carga - Coeficiente de variación">
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="dia" />

                    <YAxis
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                    />

                    <Tooltip
                        formatter={(v) => `${v}%`}
                    />

                    <Bar dataKey="equilibrio">
                        {data.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={
                                    entry.equilibrio >= 90 ? "#22c55e" :
                                        entry.equilibrio >= 75 ? "#eab308" :
                                            entry.equilibrio >= 60 ? "#f97316" :
                                                "#ef4444"
                                }
                            />
                        ))}
                    </Bar>

                </BarChart>
            </ResponsiveContainer>
        </GraficoCard>
    )

}
