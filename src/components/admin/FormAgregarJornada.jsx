import { useState } from "react"
import { contabilizarHoras, calcularDuracion } from "../../helpers/time.helpers";
import PantallaCarga from "../layout/PantallaCarga";
import { Timestamp } from "firebase/firestore";

const FormAgregarJornada = ({ cerrar, guardar }) => {
    const [fecha, setFecha] = useState("");
    const [inicio, setInicio] = useState("");
    const [fin, setFin] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] =useState(false)

    const calcularDuracion = () => {
        const parseTime = (t) => {
            if (!t) return 0;
            const parts = t.split(":").map(Number);
            let h = parts[0] || 0;
            let m = parts[1] || 0;
            let s = parts[2] || 0;
            return h * 3600 + m * 60 + s;
        };

        let inicial = parseTime(inicio);
        let final = parseTime(fin);

        if (final <= inicial) {
            final += 24 * 3600;
        }

        return contabilizarHoras(final - inicial);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true)
        setError("");

        if (!fecha || !inicio || !fin) {
            setError("Completar campos")
            return;
        }

        const duracion = calcularDuracion()

        if (duracion === null) {
            setError("Inicio debe ser mayor que final")
            setCargando(false); 
            return;
        }

        const expiracion = new Date(fecha);
        expiracion.setMonth(expiracion.getMonth() + 6)
        expiracion.setDate(1)

        const payload = {
            fecha,
            diaSemana: new Date(fecha).toLocaleDateString("es-AR", { weekday: "long", timeZone: "America/Argentina/Cordoba" }),
            numeroDia: new Date(fecha).getDate(),
            numeroDiaSemana: new Date(fecha).getDay(),
            activo: false,
            expiracion: Timestamp.fromDate(expiracion),
            inicio,
            fin,
            duracion,
            mensaje: "jornada agregada",
        }

        try {
            await guardar(payload);
            cerrar();
        } catch (e) {
            setError("Error al guardar jornada: " + e.message);
        } finally {
            setCargando(false);
        }
    }

    if (cargando) return <PantallaCarga />

    return (
        <div className="modal-jornada">
            <form onSubmit={handleSubmit}>
                <h3>Nueva jornada</h3>

                <div className="modal-jornada-labels">
                    <label>
                        Fecha
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Inicio
                        <input
                            type="time"
                            step="1"
                            value={inicio}
                            onChange={(e) => setInicio(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Fin
                        <input
                            type="time"
                            step="1"
                            value={fin}
                            onChange={(e) => setFin(e.target.value)}
                            required
                        />
                    </label>

                    {error && <p style={{ color: "red" }}>{error}</p>}
                </div>


                <div className="modal-jornada-buttons">
                    <button type="submit"> Guardar</button>
                    <button type="button" onClick={cerrar}> Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default FormAgregarJornada;