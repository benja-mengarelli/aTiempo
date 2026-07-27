import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { horasPorDiaSemana } from "../../helpers/metricas";
import { formatearHorasDecimal } from "../../helpers/time.helpers";
import GraficoCard from "../layout/GraficoCard";

export default function HorasPorDiaSemana({ jornadas }) {

    const data = horasPorDiaSemana(jornadas);

    return (

        <GraficoCard titulo="📊 Horas por día de la semana">

            <ResponsiveContainer width="100%" height={320}>

                <BarChart data={data}>

                    <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="dia"
                        tick={{ fontSize: 13 }}
                    />

                    <YAxis
                        label={{
                            value: "Horas",
                            angle: -90,
                            position: "insideLeft"
                        }}
                    />

                    <Tooltip
                        formatter={value => formatearHorasDecimal(value)}
                        contentStyle={{
                            borderRadius: 12,
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,.15)"
                        }}
                    />

                    <Bar
                        dataKey="horas"
                        fill="#0749d8"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1000}
                    />

                </BarChart>

            </ResponsiveContainer>

        </GraficoCard>

    );

}