export default function HeaderRegistro({ titulo, total, esAdmin, abrirForm }) {
    return (
        <div className="header-registro">
            <div className="header-registro-titulo">
                <h3>{titulo}</h3>
                {total != null && <span className="total-chip grande">Total {total}</span>}
            </div>
            {esAdmin && (
                <button className="btn btn-primario btn-chico" onClick={abrirForm}>
                    + Agregar jornada
                </button>
            )}
        </div>
    );
}