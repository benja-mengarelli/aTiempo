import { useState } from "react"
import { contabilizarHoras, calcularDuracion } from "../../helpers/time.helpers";
import PantallaCarga from "../layout/PantallaCarga";
import { Timestamp } from "firebase/firestore";
import Modal from "../layout/Modal";
import { useConfiguracionEmpresa } from "../../hooks/useConfiguracionEmpresa";
import { useAuth } from "../../context/AuthContext";

const aSegundos = (t) => {
    if (!t) return 0;
    const [h = 0, m = 0, s = 0] = t.split(":").map(Number);
    return h * 3600 + m * 60 + s;
};

const FormAgregarJornada = ({ cerrar, guardar }) => {
    const [fecha, setFecha] = useState("");
    const [inicio, setInicio] = useState("");
    const [fin, setFin] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const { empresaActivaId } = useAuth();
    const { configuracion } = useConfiguracionEmpresa(empresaActivaId);

    const calcularDuracion = () => {
        const inicial = aSegundos(inicio);
        let final = aSegundos(fin);
        const redondeo = configuracion.redondeoMinutos;
        const minimo = configuracion.minimoHS;
        if (final <= inicial) final += 24 * 3600; // cruza medianoche
        return contabilizarHoras(final - inicial, redondeo, minimo);
    };

    const hayRango = Boolean(inicio && fin);
    const duracionPreview = hayRango ? calcularDuracion() : null;
    const cruzaMedianoche = hayRango && aSegundos(fin) <= aSegundos(inicio);
    console.log("calcular duracion:", duracionPreview)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!fecha || !inicio || !fin) {
            setError("Completar campos")
            return;
        }

        setCargando(true);

        const dia = new Date(`${fecha}T12:00:00`);
        const expiracion = new Date(dia);
        expiracion.setMonth(expiracion.getMonth() + 6);
        expiracion.setDate(1);

        const payload = {
            fecha,
            diaSemana: dia.toLocaleDateString("es-AR", { weekday: "long", timeZone: "America/Argentina/Cordoba" }),
            numeroDia: dia.getDate(),
            numeroDiaSemana: dia.getDay(),
            activo: false,
            expiracion: Timestamp.fromDate(expiracion),
            inicio,
            fin,
            duracion: calcularDuracion(),
            mensaje: "jornada agregada",
        };


        try {
            await guardar(payload);
            cerrar();
        } catch (e) {
            setError("Error al guardar jornada: " + e.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <Modal titulo="Nueva jornada" cerrar={() => { if (!cargando) cerrar(); }}>
            <form onSubmit={handleSubmit} className="form-modal">
                <label className="campo">
                    <span>Fecha</span>
                    <input className="input" type="date" value={fecha} required
                        onChange={(e) => setFecha(e.target.value)} />
                </label>

                <div className="campos-fila">
                    <label className="campo">
                        <span>Inicio</span>
                        <input className="input" type="time" step="1" value={inicio} required
                            onChange={(e) => setInicio(e.target.value)} />
                    </label>
                    <label className="campo">
                        <span>Fin</span>
                        <input className="input" type="time" step="1" value={fin} required
                            onChange={(e) => setFin(e.target.value)} />
                    </label>
                </div>

                {duracionPreview && (
                    <div className="duracion-preview">
                        <span>Duración</span>
                        <strong>{duracionPreview}</strong>
                        {cruzaMedianoche && <small>Termina al día siguiente</small>}
                    </div>
                )}

                {error && <p className="error">{error}</p>}

                <div className="acciones-modal">
                    <button type="button" className="btn btn-glass" onClick={cerrar} disabled={cargando}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primario" disabled={cargando}>
                        {cargando ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


export default FormAgregarJornada;