import HeaderRegistro from "./HeaderRegistro";
import PanelJornadas from "./PanelJornadas";

export default function HorasPor15Dias({ agrupadas, rolActual, abrirForm, eliminarJornada }) {
    const esAdmin = rolActual === "admin";

    return (
        <div className="registro">
            <HeaderRegistro titulo="Registros por 15 días" esAdmin={esAdmin} abrirForm={abrirForm} />
            <div className="grid-paneles">
                <PanelJornadas titulo="Días 1–15" total={agrupadas.totalPrimera15} horas={agrupadas.primera15}
                    esAdmin={esAdmin} eliminarJornada={eliminarJornada} />
                <PanelJornadas titulo="Días 16–31" total={agrupadas.totalSegunda15} horas={agrupadas.segunda15}
                    esAdmin={esAdmin} eliminarJornada={eliminarJornada} />
            </div>
        </div>
    );
}
