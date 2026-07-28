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
import { intensidadDias } from "../../helpers/metricas";
import { formatearHorasDecimal } from "../../helpers/time.helpers";

export default function IntensidadDias({ jornadas }) {

    const data = intensidadDias(jornadas);
    const max = Math.max(...data.map(d => d.intensidad));

    function obtenerColor(valor) {

        const porcentaje = valor / max;

        if (porcentaje < .25) return "#4ade80";

        if (porcentaje < .50) return "#fde047";

        if (porcentaje < .75) return "#fb923c";

        return "#ef4444";

    }

    return (
        <GraficoCard titulo="⚖️ Intensidad de dias">

            <ResponsiveContainer width="100%" height={300}>

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

                    <Tooltip
                        formatter={value => formatearHorasDecimal(value)}
                        contentStyle={{
                            borderRadius: 12,
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,.15)"
                        }}
                    />

                    <Bar dataKey="intensidad">
                        {
                            data.map((d, index) => (
                                <Cell
                                    key={index}
                                    fill={obtenerColor(d.intensidad)}
                                />
                            ))
                        }
                    </Bar>

                </BarChart>

            </ResponsiveContainer>
        </GraficoCard>

    );

}

