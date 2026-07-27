import {

    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip

} from "recharts";

import GraficoCard from "../layout/GraficoCard";
import { evolucionMensual } from "../../helpers/metricas";
import { formatearHorasDecimal } from "../../helpers/time.helpers";

export default function EvolucionMensual({ jornadas }) {

    const data = evolucionMensual(jornadas);

    return (
        <GraficoCard titulo="📈 Evolución mensual"> 
            <ResponsiveContainer width="100%" height={300}>

                <LineChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis 
                        dataKey="dia"
                        label={{
                            value: "Día del mes",
                            position: "insideBottom",
                            offset: -5
                        }} 
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
                    />

                    <Line
                        type="monotone"
                        dataKey="horas"
                        stroke="#0749d8"
                        animationDuration={1000}
                    />

                </LineChart>

            </ResponsiveContainer>
        </GraficoCard>



    );

}