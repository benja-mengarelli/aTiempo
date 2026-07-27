import {

    ResponsiveContainer,
    PieChart,
    Pie,
    Tooltip

} from "recharts";
import GraficoCard from "../layout/GraficoCard";
import { jornadasPorDiaSemana } from "../../helpers/metricas";

export default function JornadasPorDiaSemana({ jornadas }) {

    const data = jornadasPorDiaSemana(jornadas);

    return (
        <GraficoCard titulo="🥧 Jornadas por día">
            
            <ResponsiveContainer width="100%" height={300}>

                <PieChart>

                    <Pie

                        data={data}

                        dataKey="jornadas"

                        nameKey="dia"

                        label

                        outerRadius={90}
                        innerRadius={25}
                        paddingAngle={3}
                        
                        fill="#0749d8"

                    />

                    <Tooltip />

                </PieChart>

            </ResponsiveContainer>
        
        </GraficoCard>

    );

}