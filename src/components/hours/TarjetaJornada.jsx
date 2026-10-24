import ChipMensaje, { claseMensaje } from "./ChipMensaje";
import BotonEliminar from "./BotonEliminar";

export default function TarjetaJornada({ h, esAdmin, eliminarJornada }) {
    return (
        <article className={`jornada-card estado-${claseMensaje(h.mensaje)}`}>
            <div className="jornada-fecha">{h.fechaCorta}</div>
            <div className="jornada-datos">
                <span className="jornada-horario">{h.inicio} – {h.fin}</span>
                <ChipMensaje mensaje={h.mensaje} />
            </div>
            <strong className="jornada-duracion">{h.duracion}</strong>
            {esAdmin && <BotonEliminar onClick={() => eliminarJornada(h.id)} />}
        </article>
    );
}