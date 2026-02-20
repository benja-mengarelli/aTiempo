import { useState } from "react"
import { contabilizarHoras } from "../../helpers/time.helpers";
import PantallaCarga from "../layout/PantallaCarga";

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

    const handleSubmit = (e) => {
        e.preventDefault();
        setCargando(true)
        setError("");

        if (!fecha || !inicio || !fin) {
            setError("Completar campos")
            return;
        }

        const duracion = calcularDuracion()

        if (duracion === null) {
            ServerRouter("Inicio debe ser mayor que final")
            return;
        }

        guardar({
            fecha,
            inicio,
            fin,
            duracion,
            mensaje: "jornada agregada"
        });

        cerrar();
        setTimeout(() => {
            setCargando(false);
        }, 700);
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