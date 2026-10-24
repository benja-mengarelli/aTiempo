import TarjetaJornada from "./TarjetaJornada";

export default function PanelJornadas({ titulo, subtitulo, total, horas, esAdmin, eliminarJornada }) {
    return (
        <section className="panel-jornadas glass">
            <header className="panel-header">
                <div>
                    <h4>{titulo}</h4>
                    {subtitulo && <small>{subtitulo}</small>}
                </div>
                <span className="total-chip">{total}</span>
            </header>

            {horas.length === 0 ? (
                <p className="vacio">No hay registros.</p>
            ) : (
                <div className="lista-jornadas">
                    {horas.map((h) => (
                        <TarjetaJornada key={h.id} h={h} esAdmin={esAdmin} eliminarJornada={eliminarJornada} />
                    ))}
                </div>
            )}
        </section>
    );
}