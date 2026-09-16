import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getJornadasRecientes } from "../../services/jornadas.service";

const DIAS_ATRAS = 5;

// tipo "eliminar": el usuario elige una jornada propia (últimos 5 días) y
// pide que se borre. guardar({ fecha, jornadaId, mensaje }) - sin payload,
// no hay datos que proponer, solo la referencia + el motivo.
const FormEliminarJornada = ({ cerrar, guardar }) => {
    const { user, empresaActivaId } = useAuth();

    const [jornadas, setJornadas] = useState([]);
    const [cargandoLista, setCargandoLista] = useState(true);
    const [seleccionada, setSeleccionada] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (!empresaActivaId || !user) return;
        setCargandoLista(true);
        getJornadasRecientes(empresaActivaId, user.uid, DIAS_ATRAS)
            .then(setJornadas)
            .catch((e) => {
                console.error("Error al traer jornadas recientes", e);
                setError("No se pudieron cargar tus jornadas recientes.");
            })
            .finally(() => setCargandoLista(false));
    }, [empresaActivaId, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!seleccionada) {
            setError("Elegí qué jornada querés eliminar.");
            return;
        }
        if (!mensaje.trim()) {
            setError("Contanos brevemente el motivo.");
            return;
        }

        setCargando(true);
        try {
            await guardar({ fecha: seleccionada.fecha, jornadaId: seleccionada.id, mensaje });
            cerrar();
        } catch (err) {
            console.error("Error al enviar la solicitud", err);
            setError(err.message || "No se pudo enviar la solicitud. Probá de nuevo.");
        } finally {
            setCargando(false);
        }
    };

    if (cargandoLista) return <p>Cargando tus jornadas recientes...</p>;

    return (
        <div className="form-user-jornada">

            <form onSubmit={handleSubmit} className="form-peticion">
                <h3>Eliminar jornada</h3>
                {jornadas.length === 0 ? (
                    <p>No tenés jornadas en los últimos {DIAS_ATRAS} días.</p>
                ) : (
                    <ul className="lista-seleccion-jornada">
                        {jornadas.map((j) => (
                            <li key={j.id}>
                                <label>
                                    <input
                                        type="radio"
                                        name="jornadaAEliminar"
                                        checked={seleccionada?.id === j.id}
                                        onChange={() => setSeleccionada(j)}
                                    />
                                    {j.fecha} — {j.inicio} a {j.fin || "(sin finalizar)"}
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
                <label>
                    Motivo
                    <textarea
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                        placeholder="¿Por qué hay que eliminarla?"
                        required
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <div className="acciones-form">
                    <button type="button" onClick={cerrar} disabled={cargando}>Cancelar</button>
                    <button type="submit" disabled={cargando || !seleccionada}>{cargando ? "Enviando..." : "Enviar solicitud"}</button>
                </div>
            </form>
        </div>
    );
};

export default FormEliminarJornada;
