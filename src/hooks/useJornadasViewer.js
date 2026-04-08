import { useState } from 'react';
import useJornadas from './useJornadas';
import { useAuth } from '../context/AuthContext';
import { getMesesDisponibles, horasFiltradas, agruparPor15Dias, agruparPorSemana } from '../helpers/jornada.helpers';
import { agregarJornada, eliminarJornada as eliminarJornadaService } from '../services/jornadas.service';

export default function useJornadasViewer({ userId, initialMonth, initialView }) {
    const FECHA_INICIO = new Date('2025-10-01');
    const { jornadas, loading } = useJornadas(userId);
    const meses = getMesesDisponibles(FECHA_INICIO);
    const [mes, setMes] = useState(initialMonth || (meses[0] && meses[0].value) || '');
    const [tipoVisualizacion, setTipoVisualizacion] = useState(initialView || 'mes');
    const { datos } = useAuth();
    const [mostrarForm, setMostrarForm] = useState(false);

    const abrirForm = () => setMostrarForm(true);
    const cerrarForm = () => setMostrarForm(false);

    const guardarJornada = async (jornada) => {
        if (datos.rol !== "admin" || !datos) {
            alert("No tienes permiso de agregar");
            return;
        }
        try {
            await agregarJornada(userId, jornada);
            console.log("Jornada agregada");
        } catch (e) {
            console.error("Error al agregar", e);
        }
        setMostrarForm(false);
    };

    const eliminarJornada = async (jornadaId) => {
        if (datos.rol !== "admin" || !datos) {
            alert("No tienes permiso de eliminar");
            return;
        }
        if (window.confirm("¿Eliminar esta jornada?")) {
            try {
                await eliminarJornadaService(userId, jornadaId);
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
