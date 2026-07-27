import {

    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip

} from "recharts";
import GraficoCard from "../layout/GraficoCard";
import { intensidadDias } from "../../helpers/metricas";
import { formatearHorasDecimal } from "../../helpers/formatearHoras";

export default function IntensidadDias({ jornadas }) {

    const data = intensidadDias(jornadas);

    return (
        <GraficoCard titulo="⚖️ Intensidad de dias">

            <ResponsiveContainer width="100%" height={300}>

                <BarChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="dia" />

                    <YAxis />

                    <Tooltip
                        formatter={(v) => formatearHorasDecimal(v)}
                    />

                    <Bar dataKey="intensidad" />

                </BarChart>

            </ResponsiveContainer>
        </GraficoCard>

    );

}