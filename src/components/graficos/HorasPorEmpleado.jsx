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

    return (
        <GraficoCard titulo="🕜 Horas por empleado"> 
            <ResponsiveContainer width="100%" height={350}>

                <BarChart data={data}>

                    <CartesianGrid strokeDasharray="3 3"/>

                    <XAxis dataKey="dia"/>

                    <YAxis/>

                    <Tooltip/>

                    <Legend/>

                    {

                        empleados.map(nombre => (

                            <Bar
                                key={nombre}
                                dataKey={nombre}
                                stackId="a"
                            />

                        ))

                    }

                </BarChart>

            </ResponsiveContainer>
        
        </GraficoCard>

    );

}