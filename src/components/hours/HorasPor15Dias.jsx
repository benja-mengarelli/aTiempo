import React from 'react';

export default function HorasPor15Dias({ agrupadas, datos, abrirForm, eliminarJornada }) {
    return (
        <div className={datos?.rol === "admin"? "registro-15-dias admin" : "registro-15-dias usuario"}>
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
