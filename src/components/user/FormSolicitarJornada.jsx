import { useState } from "react"
import { contabilizarHoras } from "../../helpers/time.helpers";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

// tipo "agregar": el usuario propone una jornada que falta cargar.
// guardar({ fecha, payload, mensaje }) - el padre arma la petición.
const FormSolicitarJornada = ({ cerrar, guardar }) => {
    const [fecha, setFecha] = useState("");
    const [inicio, setInicio] = useState("");
    const [fin, setFin] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const { user } = useAuth();

    const calcularDuracion = () => {
        const parseTime = (t) => {
            if (!t) return 0;
            const [h = 0, m = 0, s = 0] = t.split(":").map(Number);
            return h * 3600 + m * 60 + s;
        };
        let inicial = parseTime(inicio);
        let final = parseTime(fin);
        if (final <= inicial) final += 24 * 3600;
        return contabilizarHoras(final - inicial);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!fecha || !inicio || !fin) {
            setError("Completar campos");
            return;
        }
        if (!mensaje.trim()) {
            setError("Contanos brevemente el motivo de la solicitud");
            return;
        }

        const duracion = calcularDuracion();
        const expiracion = new Date(fecha);
        expiracion.setMonth(expiracion.getMonth() + 6);
        expiracion.setDate(1);

        // Mismo shape que espera agregarJornada - así al aprobar, el admin
        // lo pasa directo sin transformar nada.
        const payload = {
            fecha,
            uid: user.uid,
            diaSemana: new Date(fecha).toLocaleDateString("es-AR", { weekday: "long", timeZone: "America/Argentina/Cordoba" }),
            numeroDia: new Date(fecha).getDate(),
            numeroDiaSemana: new Date(fecha).getDay(),
            activo: false,
            expiracion: Timestamp.fromDate(expiracion),
            inicio,
            fin,
            duracion,
            mensaje: "jornada agregada",
        };

        setCargando(true);
        try {
            await guardar({ fecha, payload, mensaje });
            cerrar();
        } catch (err) {
            console.error("Error al enviar la solicitud", err);
            setError(err.message || "No se pudo enviar la solicitud. Probá de nuevo.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="form-user-jornada solicitar-jornada">
            <form onSubmit={handleSubmit} className="form-peticion">
                <h3>Solicitar jornada</h3>
                <label>
                    Fecha
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                </label>
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
                        placeholder="¿Por qué falta esta jornada? (ej: me olvidé de marcar)"
                        required
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <div className="acciones-form">
                    <button type="button" onClick={cerrar} disabled={cargando}>Cancelar</button>
                    <button type="submit" disabled={cargando}>{cargando ? "Enviando..." : "Enviar solicitud"}</button>
                </div>
            </form>
        </div>
    );
};

export default FormSolicitarJornada;