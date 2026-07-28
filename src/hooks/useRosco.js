import { useEffect, useState, useMemo } from "react";

import {preguntasPorLetra} from "../components/juegos/data/preguntas";
import { iniciarPreguntas } from "../helpers/iniciarPreguntas";

export function useRosco() {

    const [preguntas, setPreguntas] = useState([]);
    const [indice, setIndice] = useState(0);
    const [tiempo, setTiempo] = useState(150);
    const [pausado, setPausado] = useState(false);
    const [terminado, setTerminado] = useState(false);
    const [iniciado, setIniciado] = useState(false);

    function reiniciarJuego() {
        setPreguntas(iniciarPreguntas(preguntasPorLetra));
        setIndice(0);
        setTiempo(150);
        setPausado(false);
        setTerminado(false);
        setIniciado(true);
    }

    useEffect(() => {

        if (!iniciado || terminado) return;

        const intervalo = setInterval(() => {

            if (pausado) return;

            setTiempo(prev => {

                if (prev <= 1) {
                    clearInterval(intervalo);
                    setTerminado(true);
                    return 0;
                }

                return prev - 1;

            });

        }, 1000);

        return () => clearInterval(intervalo);

    }, [iniciado, pausado, terminado]);

    const actual = preguntas[indice];

    function marcar(estado) {

        setPreguntas(prev =>
            prev.map((p, i) =>
                i === indice
                    ? { ...p, estado }
                    : p
            )
        );

        setPausado(true);
    }

    function avanzar() {

        setPausado(false);

        const hayPendientes = preguntas.some(
            p => p.estado === "pendiente"
        );

        if (!hayPendientes) {
            setTerminado(true);
            return;
        }

        let siguiente = indice;

        do {
            siguiente = (siguiente + 1) % preguntas.length;
        } while (
            preguntas[siguiente].estado !== "pendiente"
        );

        setIndice(siguiente);

    }

    const correctas = useMemo(
        () => preguntas.filter(p => p.estado === "correcto").length,
        [preguntas]
    );

    const incorrectas = useMemo(
        () => preguntas.filter(p => p.estado === "incorrecto").length,
        [preguntas]
    );

    const pendientes = useMemo(
        () => preguntas.filter(p => p.estado === "pendiente").length,
        [preguntas]
    );

    return {
        iniciado,
        preguntas,
        actual,
        indice,
        tiempo,
        pausado,
        terminado,
        correctas,
        incorrectas,
        pendientes,
        marcar,
        avanzar,
        reiniciarJuego
    };
}