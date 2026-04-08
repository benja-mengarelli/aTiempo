import React from 'react';

export default function HorasPorMes({ filtradas, total, datos, abrirForm, eliminarJornada }) {
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
