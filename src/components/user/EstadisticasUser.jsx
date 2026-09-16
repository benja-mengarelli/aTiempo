import HorasPorDiaSemana from "../graficos/HorasPorDiaSemana";
import CardsResumen from "../graficos/CardsResumen";
import EvolucionMensual from "../graficos/EvolucionMensual";
import JornadasPorDiaSemana from "../graficos/JornadasPorDia";
import PantallaCarga from '../layout/PantallaCarga';

export default function EstadisticasUser() {

    return (
        <div className="dashboard-graficos">
            <CardsResumen jornadas={filtradas} />
            <EvolucionMensual jornadas={filtradas} />
            <HorasPorDiaSemana jornadas={filtradas} />
            <JornadasPorDiaSemana jornadas={filtradas} />
        </div>
    )
}