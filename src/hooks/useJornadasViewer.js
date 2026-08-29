import { useState } from 'react';
import useJornadas from './useJornadas';
import { useAuth } from '../context/AuthContext';
import { getMesesDisponibles, horasFiltradas, agruparPor15Dias, agruparPorSemana } from '../helpers/jornada.helpers';
import { agregarJornada, eliminarJornada as eliminarJornadaService } from '../services/jornadas.service';

export default function useJornadasViewer({ userId, initialMonth, initialView }) {

    const { datos, rolActual, empresaActivaId } = useAuth();

    const FECHA_INICIO = new Date('2026-01-01');
    const meses = getMesesDisponibles(FECHA_INICIO);
    const [mes, setMes] = useState(initialMonth || (meses[0] && meses[0].value) || '');

    const { jornadas, loading } = useJornadas(empresaActivaId, userId);

    const [tipoVisualizacion, setTipoVisualizacion] = useState(initialView || 'mes');
    const [mostrarForm, setMostrarForm] = useState(false);

    const abrirForm = () => setMostrarForm(true);
    const cerrarForm = () => setMostrarForm(false);

    const guardarJornada = async (jornada) => {
        // rolActual ya es null si no hay empresa activa, no hace falta chequear !datos aparte
        if (rolActual !== "admin") {
            alert("No tienes permiso de agregar");
            return;
        }
        await agregarJornada(empresaActivaId, userId, jornada);
        console.log("Jornada agregada");
    };

    const eliminarJornada = async (jornadaId) => {
        if (rolActual !== "admin") {
            alert("No tienes permiso de eliminar");
            return;
        }
        if (window.confirm("¿Eliminar esta jornada?")) {
            try {
                await eliminarJornadaService(empresaActivaId, jornadaId);
                console.log("Jornada eliminada");
            } catch (e) {
                console.error("Error al eliminar jornada", e);
            }
        }
    };
    // Prepare props for each view
    const filtradas = horasFiltradas(jornadas, mes);
    const agrupadas = agruparPor15Dias(filtradas);
    const semanas = agruparPorSemana(filtradas);
    const total = agrupadas.totalPrimera15 + agrupadas.totalSegunda15;

    return {
        meses,
        mes,
        setMes,
        tipoVisualizacion,
        setTipoVisualizacion,
        mostrarForm,
        setMostrarForm,
        loading,
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
    };
}
