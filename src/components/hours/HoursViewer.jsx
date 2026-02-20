import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useJornadas from '../../hooks/useJornadas';
import { horasFiltradas, agruparPor15Dias, agruparPorSemana, getMesesDisponibles } from '../../helpers/jornada.helpers';
import { useAuth } from '../../context/AuthContext';
import { addDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import FormAgregarJornada from '../admin/FormAgregarJornada';

export default function HoursViewer({ userId, initialMonth, initialView }) {
    const FECHA_INICIO = new Date('2025-10-01');
    const { jornadas, loading } = useJornadas(userId);
    const meses = getMesesDisponibles(FECHA_INICIO);
    const [mes, setMes] = useState(initialMonth || (meses[0] && meses[0].value) || '');
    const [tipoVisualizacion, setTipoVisualizacion] = useState(initialView || 'mes');
    const { datos } = useAuth()
    const [mostrarForm, setMostrarForm] = useState(false)

    const abrirForm = () => setMostrarForm(true);
    const cerrarForm = () => setMostrarForm(false);

    if (loading) return <div>Cargando jornadas...</div>;

    const guardarJornada = async (jornada) => {
        if (datos.rol !== "admin" || !datos) {
            alert("No tienes permiso de agregar");
            return;
        }
        try {
            const ref = collection(db, "users", userId, "jornadas");
            await addDoc(ref, jornada);
            console.log("Jornada agregada");
        } catch (e) {
            console.error("Error al agregar", e);
        }
        setMostrarForm(false);
    }

    async function eliminarJornada(jornadaId) {
        if (datos.rol !== "admin" || !datos) {
            alert("No tienes permiso de eliminar")
            return;
        }
        if (confirm("¿Eliminar esta jornada?")) {
            try {
                const ref = doc(db, "users", userId, "jornadas", jornadaId);
                await deleteDoc(ref);
                console.log("Jornada eliminada")
            } catch (e) {
                console.error("Error al eliminar jornada", e)
            }
        }
    }

    function renderPorMes() {
        const filtradas = horasFiltradas(jornadas, mes);
        const total = agruparPor15Dias(filtradas).totalPrimera15 + agruparPor15Dias(filtradas).totalSegunda15
        return (
            <div className='registro-por-mes'>
                <div className='header-registro'>
                    <h3>Registros del mes (total: {total})</h3>

                    {datos?.rol === "admin" && <button onClick={abrirForm} className='btn-agregar-jornada'><strong>Agregar jornada</strong> </button>}
                </div>
                {filtradas.length === 0 ? (
                    <p>No hay registros para este mes.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th >Fecha</th>
                                <th >Inicio - Fin</th>
                                <th >Duración</th>
                                <th >Mensaje</th>
                                {datos?.rol === "admin" && <th>🗑️</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map((h) => (
                                <tr key={h.id} style={{ backgroundColor: "var(--bg-card)" }} >
                                    <td >{h.fecha}</td>
                                    <td >{h.inicio} - {h.fin}</td>
                                    <td >{h.duracion}</td>
                                    <td style={{ backgroundColor: h.mensaje == "ubicacion correcta" ? "var(--secundario)" : h.mensaje == "jornada agregada" ? "var(--medio)" : "var(--incorrecto)" }}>{h.mensaje}</td>

                                    {datos?.rol === "admin" &&
                                        <button onClick={() => eliminarJornada(h.id)}>
                                            ⛔
                                        </button>
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    }

    function renderPor15Dias() {
        const filtradas = horasFiltradas(jornadas, mes);
        const agrupadas = agruparPor15Dias(filtradas);
        return (
            <div className='registro-15-dias'>

                <div className='header-registro'>
                    <h3>Registros por 15 días</h3>

                    {datos?.rol === "admin" && <button onClick={abrirForm} className='btn-agregar-jornada'>Agregar jornada </button>}
                </div>

                <div className='registro-15-dias-contenedor'>
                    <div className='quincenas'>
                        <h4>Días 1-15 (Total: {agrupadas.totalPrimera15})</h4>
                        {agrupadas.primera15.length === 0 ? (
                            <p>No hay registros.</p>
                        ) : (
                            <ul>
                                {agrupadas.primera15.map((h) => (
                                    <li key={h.id} >
                                        <div style={{ backgroundColor: h.mensaje == "ubicacion correcta" ? "var(--secundario)" : h.mensaje == "jornada agregada" ? "var(--medio)" : "var(--incorrecto)" }}>
                                            <strong>{h.fecha}</strong> - {h.inicio} a {h.fin} ({h.duracion})
                                            <br />
                                            <small>{h.mensaje}</small>
                                        </div>

                                        {datos?.rol === "admin" &&
                                            <button onClick={() => eliminarJornada(h.id)}>
                                                ⛔
                                            </button>}

                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className='quincenas'>
                        <h4>Días 16-31 (Total: {agrupadas.totalSegunda15})</h4>
                        {agrupadas.segunda15.length === 0 ? (
                            <p>No hay registros.</p>
                        ) : (
                            <ul>
                                {agrupadas.segunda15.map((h) => (
                                    <li key={h.id}>
                                        <div style={{ backgroundColor: h.mensaje == "ubicacion correcta" ? "var(--secundario)" : h.mensaje == "jornada agregada" ? "var(--medio)" : "var(--incorrecto)" }}>
                                            <strong>{h.fecha}</strong> - {h.inicio} a {h.fin} ({h.duracion})
                                            <br />
                                            <small>{h.mensaje}</small>
                                        </div>
                                        {datos?.rol === "admin" &&
                                            <button onClick={() => eliminarJornada(h.id)}>
                                                ⛔
                                            </button>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    function renderPorSemanas() {
        const filtradas = horasFiltradas(jornadas, mes);
        const semanas = agruparPorSemana(filtradas);
        return (
            <div className='registro-por-semana'>
                <div className='header-registro'>
                    <h3>Registros por semana</h3>

                    {datos?.rol === "admin" && <button onClick={abrirForm} className='btn-agregar-jornada'>Agregar jornada </button>}
                </div>
                <div className='grid-semanal'>
                    {[semanas.semana1, semanas.semana2, semanas.semana3, semanas.semana4].map((semana, idx) => (
                        <div key={idx} className='contenedor-grid-semanal'>
                            <h4>Semana {idx + 1} (Días {semana.dias}) - Total: {semana.total}</h4>
                            {semana.horas.length === 0 ? (
                                <p>No hay registros.</p>
                            ) : (
                                <ul>
                                    {semana.horas.map((h) => (
                                        <li key={h.id}>
                                            <div style={{ backgroundColor: h.mensaje == "ubicacion correcta" ? "var(--secundario)" : h.mensaje == "jornada agregada" ? "var(--medio)" : "var(--incorrecto)" }}>
                                                <strong>{h.fecha}</strong> - {h.inicio} a {h.fin} ({h.duracion})
                                                <br />
                                                <small>{h.mensaje}</small>
                                            </div>

                                            {datos?.rol === "admin" &&
                                                <button onClick={() => eliminarJornada(h.id)}>
                                                    ⛔
                                                </button>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mis-horas">
            {/* Filtros */}
            <div className="filtros">
                <div className="visualizacion-fechas">
                    {meses.map(m => (
                        <button
                            key={m.value}
                            onClick={() => setMes(m.value)}
                            style={{
                                backgroundColor: mes === m.value ? "var(--primario)" : "#ddd",
                                color: mes === m.value ? "white" : "black",
                                transform: mes === m.value ? "scale(1.1)" : "none",
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* visualizacion */}
                <div className="visualizacion-horas">
                    <button
                        onClick={() => setTipoVisualizacion("mes")}
                        style={{
                            backgroundColor: tipoVisualizacion === "mes" ? "var(--primario)" : "#ddd",
                            color: tipoVisualizacion === "mes" ? "white" : "black",
                            transform: tipoVisualizacion === "mes" ? "scale(1.1)" : "none"
                        }}
                    >
                        Mes
                    </button>
                    <button
                        onClick={() => setTipoVisualizacion("15dias")}
                        style={{
                            backgroundColor: tipoVisualizacion === "15dias" ? "var(--primario)" : "#ddd",
                            color: tipoVisualizacion === "15dias" ? "white" : "black",
                            transform: tipoVisualizacion === "15dias" ? "scale(1.1)" : "none"
                        }}
                    >
                        15 Días
                    </button>
                    <button
                        onClick={() => setTipoVisualizacion("semanas")}
                        style={{
                            backgroundColor: tipoVisualizacion === "semanas" ? "var(--primario)" : "#ddd",
                            color: tipoVisualizacion === "semanas" ? "white" : "black",
                            transform: tipoVisualizacion === "semana" ? "scale(1.1)" : "none"
                        }}
                    >
                        Semana
                    </button>
                </div>
            </div>


            <div>{tipoVisualizacion === 'mes' && renderPorMes()}</div>
            <div>{tipoVisualizacion === '15dias' && renderPor15Dias()}</div>
            <div>{tipoVisualizacion === 'semanas' && renderPorSemanas()}</div>

            {mostrarForm && (
                <FormAgregarJornada
                    guardar={guardarJornada}
                    cerrar={cerrarForm}
                />
            )}
        </div>
    );
}

HoursViewer.propTypes = {
    userId: PropTypes.string.isRequired,
    initialMonth: PropTypes.string,
    initialView: PropTypes.string
};
