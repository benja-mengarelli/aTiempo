const CLASES = { "ubicacion correcta": "ok", "jornada agregada": "medio" };
export const claseMensaje = (m) => CLASES[m] ?? "error";

export default function ChipMensaje({ mensaje }) {
    return <span className={`chip chip-${claseMensaje(mensaje)}`}>{mensaje}</span>;
}