import { resumen } from "../../helpers/metricas";
import { formatearHorasDecimal } from "../../helpers/time.helpers";


export default function CardsResumen({ jornadas }) {

    const datos = resumen(jornadas);

    return (

        <div className="cards-resumen">

            <div className="card">

                <h3>Total 🟰</h3>

                <p>{formatearHorasDecimal(datos.total)}</p>

            </div>

            <div className="card">

                <h3>Promedio ➗</h3>

                <p>{formatearHorasDecimal(datos.promedio)}</p>

            </div>

            <div className="card">

                <h3>Mayor 🏋️</h3>

                <p>{formatearHorasDecimal(datos.mayor)}</p>

            </div>

            <div className="card">

                <h3>Menor 🐌</h3>

                <p>{formatearHorasDecimal(datos.menor)}</p>

            </div>

        </div>

    );

}