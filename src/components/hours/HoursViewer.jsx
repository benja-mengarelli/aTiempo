import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useJornadasViewer from '../../hooks/useJornadasViewer';
import HorasPorMes from './HorasPorMes';
import HorasPor15Dias from './HorasPor15Dias';
import HorasPorSemana from './HorasPorSemana';
import FormAgregarJornada from '../admin/FormAgregarJornada';
import PantallaCarga from '../layout/PantallaCarga';

export default function HoursViewer({ userId, initialMonth, initialView }) {
    const {
        meses,
        mes,
        setMes,
        tipoVisualizacion,
        setTipoVisualizacion,
        mostrarForm,
        setMostrarForm,
        loading,
        datos,
        filtradas,
        agrupadas,
        semanas,
        total,
        guardarJornada,
        eliminarJornada,
        abrirForm,
        cerrarForm
    } = useJornadasViewer({ userId, initialMonth, initialView });

    if (loading) return <PantallaCarga />;

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
                            transform: tipoVisualizacion === "semanas" ? "scale(1.1)" : "none"
                        }}
                    >
                        Semana
                    </button>
                </div>

            </div>

            <div>
                {tipoVisualizacion === 'mes' && (
                    <HorasPorMes
                        filtradas={filtradas}
                        total={total}
                        datos={datos}
                        abrirForm={abrirForm}
                        eliminarJornada={eliminarJornada}
                    />
                )}
                {tipoVisualizacion === '15dias' && (
                    <HorasPor15Dias
                        agrupadas={agrupadas}
                        datos={datos}
                        abrirForm={abrirForm}
                        eliminarJornada={eliminarJornada}
                    />
                )}
                {tipoVisualizacion === 'semanas' && (
                    <HorasPorSemana
                        semanas={semanas}
                        datos={datos}
                        abrirForm={abrirForm}
                        eliminarJornada={eliminarJornada}
                    />
                )}
            </div>

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
