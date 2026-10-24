import { useState } from "react";
import Modal from "../layout/Modal";

const ETIQUETAS_TIPO = {
    agregar: "Solicitar jornada",
    editar: "Editar jornada",
    eliminar: "Eliminar jornada",
};

const CLASE_TIPO = {
    agregar: "chip-ok",
    editar: "chip-medio",
    eliminar: "chip-error",
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

    // no cerrar (Esc / click afuera) mientras se está guardando
    const cerrarSeguro = () => { if (!procesando) cerrar(); };

    const confirmarBulk = (accion, verbo) => {
        if (window.confirm(`¿${verbo} las ${peticiones.length} peticiones?`)) {
            ejecutar(accion, peticiones);
        }
    };


    // ---------------- Detalle ----------------
    if (seleccionada) {
        const p = seleccionada;
        return (
            <Modal titulo={ETIQUETAS_TIPO[p.tipo]} cerrar={cerrarSeguro} grande>
                <div className="peticion-quien">
                    <div className="box-avatar chico">{p.nombre?.[0]}</div>
                    <div className="peticion-info">
                        <strong>{p.nombre}</strong>
                        <small>{p.fecha}</small>
                    </div>
                </div>

                {p.mensaje && (
                    <div className="peticion-motivo">
                        <small>Motivo</small>
                        <p>{p.mensaje}</p>
                    </div>
                )}

                {p.payload && (
                    <div className="peticion-payload">
                        <div><small>Inicio</small><strong>{p.payload.inicio}</strong></div>
                        <div><small>Fin</small><strong>{p.payload.fin}</strong></div>
                        <div><small>Duración</small><strong>{p.payload.duracion}</strong></div>
                    </div>
                )}

                {error && <p className="error">{error}</p>}

                <div className="acciones-modal repartidas">
                    <button className="btn btn-glass" onClick={() => setSeleccionada(null)} disabled={procesando}>
                        ← Volver
                    </button>
                    <div className="grupo">
                        <button className="btn btn-peligro" onClick={() => ejecutar(onEliminar, p.id)} disabled={procesando}>
                            Eliminar
                        </button>
                        <button className="btn btn-primario" onClick={() => ejecutar(onAceptar, p)} disabled={procesando}>
                            {procesando ? "Procesando..." : "Aceptar"}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    // ---------------- Listado ----------------
    return (
        <Modal titulo={`Peticiones pendientes (${peticiones.length})`} cerrar={cerrarSeguro} grande>
            {peticiones.length === 0 ? (
                <p className="vacio">No hay peticiones pendientes ✅</p>
            ) : (
                <>
                    <div className="acciones-modal">
                        <button className="btn btn-peligro btn-chico" disabled={procesando}
                            onClick={() => confirmarBulk(onEliminarTodas, "Eliminar")}>
                            Eliminar todas
                        </button>
                        <button className="btn btn-primario btn-chico" disabled={procesando}
                            onClick={() => confirmarBulk(onAceptarTodas, "Aceptar")}>
                            {procesando ? "Procesando..." : "Aceptar todas"}
                        </button>
                    </div>

                    <div className="lista-peticiones">
                        {peticiones.map((p) => (
                            <button key={p.id} className="fila-peticion" onClick={() => setSeleccionada(p)}>
                                <div className="box-avatar chico">{p.nombre?.[0]}</div>
                                <div className="peticion-info">
                                    <strong>{p.nombre}</strong>
                                    <small>{p.fecha}</small>
                                </div>
                                <span className={`chip ${CLASE_TIPO[p.tipo]}`}>{ETIQUETAS_TIPO[p.tipo]}</span>
                                <span className="flecha">›</span>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {error && <p className="error">{error}</p>}

            <div className="acciones-modal">
                <button className="btn btn-glass" onClick={cerrar} disabled={procesando}>Cerrar</button>
            </div>
        </Modal>
    );
}