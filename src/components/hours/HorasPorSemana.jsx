import HeaderRegistro from "./HeaderRegistro";
import PanelJornadas from "./PanelJornadas";

export default function HorasPorSemana({ semanas, rolActual, abrirForm, eliminarJornada }) {
    const esAdmin = rolActual === "admin";
    const lista = [semanas.semana1, semanas.semana2, semanas.semana3, semanas.semana4];

    return (
        <div className="registro">
            <HeaderRegistro titulo="Registros por semana" esAdmin={esAdmin} abrirForm={abrirForm} />
            <div className="grid-paneles">
                {lista.map((s, idx) => (
                    <PanelJornadas key={idx} titulo={`Semana ${idx + 1}`} subtitulo={`Días ${s.dias}`}
                        total={s.total} horas={s.horas} esAdmin={esAdmin} eliminarJornada={eliminarJornada} />
                ))}
            </div>
        </div>
    );
}