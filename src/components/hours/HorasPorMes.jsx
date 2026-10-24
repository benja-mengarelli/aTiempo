import HeaderRegistro from "./HeaderRegistro";
import ChipMensaje from "./ChipMensaje";
import BotonEliminar from "./BotonEliminar";

export default function HorasPorMes({ filtradas, total, rolActual, abrirForm, eliminarJornada }) {
    const esAdmin = rolActual === "admin";

    return (
        <div className="registro">
            <HeaderRegistro titulo="Registros del mes" total={total} esAdmin={esAdmin} abrirForm={abrirForm} />

            {filtradas.length === 0 ? (
                <p className="vacio glass">No hay registros para este mes.</p>
            ) : (
                <div className="tabla-wrap glass">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Inicio – Fin</th>
                                <th>Duración</th>
                                <th>Mensaje</th>
                                {esAdmin && <th aria-label="Acciones" />}
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map((h) => (
                                <tr key={h.id}>
                                    <td data-label="Fecha"><strong>{h.fechaCorta}</strong></td>
                                    <td data-label="Horario">{h.inicio} – {h.fin}</td>
                                    <td data-label="Duración"><strong>{h.duracion}</strong></td>
                                    <td data-label="Mensaje"><ChipMensaje mensaje={h.mensaje} /></td>
                                    {esAdmin && (
                                        <td data-label="">
                                            <BotonEliminar onClick={() => eliminarJornada(h.id)} />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}