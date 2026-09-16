import { useState } from "react";

const ETIQUETAS_TIPO = {
    agregar: "Solicitar jornada",
    editar: "Editar jornada",
    eliminar: "Eliminar jornada",
};

/**
 * Props:
 *   peticiones  -> array (de usePeticionesAdmin en Admin.jsx)
 *   cerrar      -> vuelve a la pantalla principal de admin
 *   onAceptar(peticion)          -> bulk_aprobarPeticiones(empresaId, [peticion])
 *   onEliminar(peticionId)       -> bulk_eliminarPeticiones(empresaId, [peticionId])
 *   onAceptarTodas(peticiones)   -> bulk_aprobarPeticiones(empresaId, peticiones)
 *   onEliminarTodas(peticiones)  -> bulk_eliminarPeticiones(empresaId, peticiones.map(p => p.id))
 */
export default function PantallaPeticiones({
    peticiones,
    cerrar,
    onAceptar,
    onEliminar,
    onAceptarTodas,
    onEliminarTodas,
}) {
    const [seleccionada, setSeleccionada] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");

    const ejecutar = async (accion, ...args) => {
        setProcesando(true);
        setError("");
        try {
            await accion(...args);
            setSeleccionada(null); // vuelve al listado si estaba en detalle
        } catch (e) {
            console.error("Error al procesar petición", e);
            setError("No se pudo completar la acción. Probá de nuevo.");
        } finally {
            setProcesando(false);
        }
    };

    // ---------------- Vista detalle (una petición) ----------------
    if (seleccionada) {
        return (
            <div className="pantalla-peticiones detalle">
                <div className="box-peticiones">

                    <button onClick={() => setSeleccionada(null)} disabled={procesando} className="volver-peticiones">← Volver</button>

                    <h3>{ETIQUETAS_TIPO[seleccionada.tipo]}</h3>
                    <p><strong>Solicitado por:</strong> {seleccionada.nombre}</p>
                    <p><strong>Fecha:</strong> {seleccionada.fecha}</p>
                    {seleccionada.mensaje && <p><strong>Motivo:</strong> {seleccionada.mensaje}</p>}

                    {seleccionada.payload && (
                        <div className="detalle-payload">
                            <p><strong>Inicio:</strong> {seleccionada.payload.inicio}</p>
                            <p><strong>Fin:</strong> {seleccionada.payload.fin}</p>
                            <p><strong>Duración:</strong> {seleccionada.payload.duracion}</p>
                        </div>
                    )}

                    {error && <p className="error">{error}</p>}

                    <div className="acciones-peticion">
                        <button
                            onClick={() => ejecutar(onEliminar, seleccionada.id)}
                            disabled={procesando}
                        >
                            Eliminar esta
                        </button>
                        <button
                            onClick={() => ejecutar(onAceptar, seleccionada)}
                            disabled={procesando}
                        >
                            {procesando ? "Procesando..." : "Aceptar esta"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ---------------- Vista listado ----------------
    return (
        <div className="pantalla-peticiones listado">
            <div className="box-peticiones">

                <div className="header-peticiones">
                    <h2>Peticiones pendientes ({peticiones.length})</h2>
                </div>

                {peticiones.length === 0 ? (
                    <p>No hay peticiones pendientes.</p>
                ) : (
                    <>
                        <div className="acciones-bulk">
                            <button onClick={() => ejecutar(onEliminarTodas, peticiones)} disabled={procesando}>
                                Eliminar todas
                            </button>
                            <button onClick={() => ejecutar(onAceptarTodas, peticiones)} disabled={procesando}>
                                {procesando ? "Procesando..." : "Aceptar todas"}
                            </button>
                        </div>

                        <ul className="lista-peticiones">
                            {peticiones.map((p) => (
                                <li key={p.id} className="fila-peticion">
                                    <button className="ver-detalle" onClick={() => setSeleccionada(p)}>
                                        {p.nombre} — {p.fecha} — {ETIQUETAS_TIPO[p.tipo]}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {error && <p className="error">{error}</p>}
                <button onClick={cerrar} disabled={procesando} className="cerrar-peticiones">Cerrar</button>
            </div>
        </div>
    );
}
