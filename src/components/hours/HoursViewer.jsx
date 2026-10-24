import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useJornadasViewer from '../../hooks/useJornadasViewer';
import HorasPorMes from './HorasPorMes';
import HorasPor15Dias from './HorasPor15Dias';
import HorasPorSemana from './HorasPorSemana';
import FormAgregarJornada from '../admin/FormAgregarJornada';
import PantallaCarga from '../layout/PantallaCarga';
import CardsResumen from '../graficos/CardsResumen';

const VISTAS = [
    { id: "mes", label: "Mes" },
    { id: "15dias", label: "15 días" },
    { id: "semanas", label: "Semana" },
];

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
        error,
        datos,
        rolActual,
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

    if (error) {
        return (
            <div className="mis-horas">
                <div className="aviso-error glass">
                    Ocurrió un error al cargar las jornadas: {error.message || String(error)}
                </div>
            </div>
        );
    }

    const indiceVista = VISTAS.findIndex((v) => v.id === tipoVisualizacion);

    return (
        <div className="mis-horas">
            <div className="filtros">
                <div className="selector-meses">
                    {meses.map((m) => (
                        <button key={m.value} className={`pill ${mes === m.value ? "activo" : ""}`}
                            onClick={() => setMes(m.value)}>
                            {m.label}
                        </button>
                    ))}
                </div>

                <div className="segmentado" style={{ "--i": indiceVista, "--n": VISTAS.length }}>
                    <span className="segmentado-thumb" />
                    {VISTAS.map((v) => (
                        <button key={v.id}
                            className={`segmentado-btn ${tipoVisualizacion === v.id ? "activo" : ""}`}
                            onClick={() => setTipoVisualizacion(v.id)}>
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* key: re-monta y dispara el fade al cambiar de vista */}
            <div className="vista-horas" key={tipoVisualizacion}>
                {tipoVisualizacion === "mes" && (
                    <HorasPorMes filtradas={filtradas} total={total} rolActual={rolActual}
                        abrirForm={abrirForm} eliminarJornada={eliminarJornada} />
                )}
                {tipoVisualizacion === "15dias" && (
                    <HorasPor15Dias agrupadas={agrupadas} rolActual={rolActual}
                        abrirForm={abrirForm} eliminarJornada={eliminarJornada} />
                )}
                {tipoVisualizacion === "semanas" && (
                    <HorasPorSemana semanas={semanas} rolActual={rolActual}
                        abrirForm={abrirForm} eliminarJornada={eliminarJornada} />
                )}
            </div>

            <div className="dashboard-graficos">
                <CardsResumen jornadas={filtradas} />
            </div>

            {mostrarForm && <FormAgregarJornada guardar={guardarJornada} cerrar={cerrarForm} />}
        </div>
    );
}


HoursViewer.propTypes = {
    userId: PropTypes.string.isRequired,
    initialMonth: PropTypes.string,
    initialView: PropTypes.string
};
