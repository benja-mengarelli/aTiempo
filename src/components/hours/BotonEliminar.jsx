export default function BotonEliminar({ onClick }) {
    return (
        <button className="btn-icono peligro" onClick={onClick} aria-label="Eliminar jornada" title="Eliminar">
            🗑️
        </button>
    );
}