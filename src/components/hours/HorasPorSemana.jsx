import React from 'react';

export default function HorasPorSemana({ semanas, datos, abrirForm, eliminarJornada }) {
    return (
        <div className={datos?.rol === "admin"? "registro-por-semana admin" : "registro-por-semana usuario"}>
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
