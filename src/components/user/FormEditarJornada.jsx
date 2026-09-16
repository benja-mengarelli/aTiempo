import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getJornadasRecientes } from "../../services/jornadas.service";
import { contabilizarHoras } from "../../helpers/time.helpers";

const DIAS_ATRAS = 5;

// inicio/fin en la jornada están guardados con toLocaleTimeString()
// (ej: "6:38:58 p.m."), pero <input type="time"> necesita "HH:MM".
// Best-effort: si no se puede parsear, queda vacío y lo completa a mano.
const aInputTime = (horaTexto) => {
    try {
        const ref = new Date(`2000-01-01 ${horaTexto}`);
        if (isNaN(ref.getTime())) return "";
        const hh = String(ref.getHours()).padStart(2, "0");
        const mm = String(ref.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    } catch {
        return "";
    }
};

// tipo "editar": el usuario elige una jornada propia (últimos 5 días) y
// propone nuevos horarios. guardar({ fecha, jornadaId, payload, mensaje }).
const FormEditarJornada = ({ cerrar, guardar }) => {
    const { user, empresaActivaId } = useAuth();

    const [jornadas, setJornadas] = useState([]);
    const [cargandoLista, setCargandoLista] = useState(true);
    const [seleccionada, setSeleccionada] = useState(null);

    const [inicio, setInicio] = useState("");
    const [fin, setFin] = useState("");
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

    const seleccionar = (jornada) => {
        setSeleccionada(jornada);
        setInicio(jornada.inicio ? aInputTime(jornada.inicio) : "");
        setFin(jornada.fin ? aInputTime(jornada.fin) : "");
    };

    const calcularDuracion = () => {
        const parseTime = (t) => {
            if (!t) return 0;
            const [h = 0, m = 0] = t.split(":").map(Number);
            return h * 3600 + m * 60;
        };
        let inicial = parseTime(inicio);
        let final = parseTime(fin);
        if (final <= inicial) final += 24 * 3600;
        return contabilizarHoras(final - inicial);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!seleccionada) {
            setError("Elegí qué jornada querés editar.");
            return;
        }
        if (!inicio || !fin) {
            setError("Completar horarios.");
            return;
        }
        if (!mensaje.trim()) {
            setError("Contanos brevemente el motivo del cambio.");
            return;
        }

        // Partimos de la jornada actual y pisamos solo lo editado - mismo
        // shape que espera updateDoc, para que el admin lo apruebe directo.
        const payload = {
            ...seleccionada,
            inicio,
            fin,
            duracion: calcularDuracion(),
            mensaje: "jornada editada",
        };
        delete payload.id; // no es un campo del doc, es el id del doc en sí

        setCargando(true);
        try {
            await guardar({ fecha: seleccionada.fecha, jornadaId: seleccionada.id, payload, mensaje });
            cerrar();
        } catch (err) {
            console.error("Error al enviar la solicitud", err);
            setError(err.message || "No se pudo enviar la solicitud. Probá de nuevo.");
        } finally {
            setCargando(false);
        }
    };

    if (cargandoLista) return <p>Cargando tus jornadas recientes...</p>;

    if (!seleccionada) {
        return (
            <div className="form-user-jornada seleccion-jornada">
                <h3>Editar jornada</h3>
                {jornadas.length === 0 ? (
                    <p>No tenés jornadas en los últimos {DIAS_ATRAS} días.</p>
                ) : (
                    <ul className="lista-seleccion-jornada">
                        {jornadas.map((j) => (
                            <li key={j.id}>
                                <button type="button" onClick={() => seleccionar(j)}>
                                    {j.fecha} — {j.inicio} a {j.fin || "(sin finalizar)"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {error && <p className="error">{error}</p>}
                <button type="button" onClick={cerrar}>Cancelar</button>
            </div>
        );
    }

    return (

        <div className="form-user-jornada">

            <form onSubmit={handleSubmit} className="form-peticion">
                <h3>Editar jornada del {seleccionada.fecha}</h3>
                <label>
                    Inicio
                    <input type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
                </label>
                <label>
                    Fin
                    <input type="time" value={fin} onChange={(e) => setFin(e.target.value)} required />
                </label>
                <label>
                    Motivo
                    <textarea
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                        placeholder="¿Qué hay que corregir?"
                        required
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <div className="acciones-form">
                    <button type="button" onClick={() => setSeleccionada(null)} disabled={cargando}>Volver</button>
                    <button type="submit" disabled={cargando}>{cargando ? "Enviando..." : "Enviar solicitud"}</button>
                </div>
            </form>


        </div>
    );
};

export default FormEditarJornada;
