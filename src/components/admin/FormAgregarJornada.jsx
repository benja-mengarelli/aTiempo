import { useState } from "react"
import { contabilizarHoras } from "../../helpers/time.helpers";

const FormAgregarJornada = ({cerrar, guardar}) => {
    const [fecha, setFecha] = useState("");
    const [inicio, setInicio] = useState("");
    const [fin, setFin] = useState("");
    const [error, setError] = useState("");

    const calcularDuracion = () => {
        const segundos = (t) => {
            const [h, m, s = "0"] = t.split(":").map(Number);
            return h*3600 + m*60 + s;
        };

        const inicial = segundos(inicio);
        const final = segundos(fin);

        if (final <= inicial) return null;

        return contabilizarHoras(final - inicial);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!fecha || !inicio || !fin) {
            setError("Completar campos")
            return;
        }

        const duracion = calcularDuracion()

        if (duracion === null){
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
    }

    return (
        <div className="modal-jornada" style={{position: "fixed", inset:"0", display:"grid", placeItems: "center", zIndex: "999" }}>
            <form onSubmit={handleSubmit}>
                <h3>Nueva jornada</h3>

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

                {error && <p style={{color: "red"}}>{error}</p>}

                <div>
                    <button type="submit"> Guardar</button>
                    <button type="button" onClick={cerrar}> Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default FormAgregarJornada;