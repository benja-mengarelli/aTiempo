import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useJornadas from '../../hooks/useJornadas';
import { horasFiltradas, agruparPor15Dias, agruparPorSemana, getMesesDisponibles } from '../../helpers/jornada.helpers';

export default function HoursViewer({ userId, initialMonth, initialView }) {
    const FECHA_INICIO = new Date('2025-10-01');
    const { jornadas, loading } = useJornadas(userId);
    const meses = getMesesDisponibles(FECHA_INICIO);
    const [mes, setMes] = useState(initialMonth || (meses[0] && meses[0].value) || '');
    const [tipoVisualizacion, setTipoVisualizacion] = useState(initialView || 'mes');

    if (loading) return <div>Cargando jornadas...</div>;

    function renderPorMes() {
        const filtradas = horasFiltradas(jornadas, mes);
        return (
            <div>
                <h3>Registros del mes</h3>
                {filtradas.length === 0 ? (
                    <p>No hay registros para este mes.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Fecha</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Inicio</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Fin</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Duración</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Mensaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map((h) => (
                                <tr key={h.id}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.fecha}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.inicio}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.fin}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.duracion}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.mensaje}</td>
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
            <div>
                <h3>Registros por 15 días</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
                        <h4>Días 1-15 (Total: {agrupadas.totalPrimera15})</h4>
                        {agrupadas.primera15.length === 0 ? (
                            <p>No hay registros.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {agrupadas.primera15.map((h) => (
                                    <li key={h.id} style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                        <strong>{h.fecha}</strong> - {h.inicio} a {h.fin} ({h.duracion})
                                        <br />
                                        <small>{h.mensaje}</small>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
                        <h4>Días 16-31 (Total: {agrupadas.totalSegunda15})</h4>
                        {agrupadas.segunda15.length === 0 ? (
                            <p>No hay registros.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {agrupadas.segunda15.map((h) => (
                                    <li key={h.id} style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                        <strong>{h.fecha}</strong> - {h.inicio} a {h.fin} ({h.duracion})
                                        <br />
                                        <small>{h.mensaje}</small>
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
            <div>
                <h3>Registros por semana</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {[semanas.semana1, semanas.semana2, semanas.semana3, semanas.semana4].map((semana, idx) => (
                        <div key={idx} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
                            <h4>Semana {idx + 1} (Días {semana.dias}) - Total: {semana.total}</h4>
                            {semana.horas.length === 0 ? (
                                <p>No hay registros.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {semana.horas.map((h) => (
                                        <li key={h.id} style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#f9f9f9', borderRadius: '3px' }}>
                                            <strong>{h.fecha}</strong> - {h.inicio} a {h.fin} ({h.duracion})
                                            <br />
                                            <small>{h.mensaje}</small>
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
                                backgroundColor: mes === m.value ? "#007bff" : "#ddd",
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
                            backgroundColor: tipoVisualizacion === "mes" ? "#007bff" : "#ddd",
                            color: tipoVisualizacion === "mes" ? "white" : "black",
                            transform: tipoVisualizacion === "mes" ? "scale(1.1)" : "none"
                        }}
                    >
                        Mes
                    </button>
                    <button
                        onClick={() => setTipoVisualizacion("15dias")}
                        style={{
                            backgroundColor: tipoVisualizacion === "15dias" ? "#007bff" : "#ddd",
                            color: tipoVisualizacion === "15dias" ? "white" : "black",
                            transform: tipoVisualizacion === "15dias" ? "scale(1.1)" : "none"
                        }}
                    >
                        15 Días
                    </button>
                    <button
                        onClick={() => setTipoVisualizacion("semanas")}
                        style={{
                            backgroundColor: tipoVisualizacion === "semanas" ? "#007bff" : "#ddd",
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
        </div>
    );
}

HoursViewer.propTypes = {
    userId: PropTypes.string.isRequired,
    initialMonth: PropTypes.string,
    initialView: PropTypes.string
};
