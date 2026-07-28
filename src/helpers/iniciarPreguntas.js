export function iniciarPreguntas(preguntasPorLetra) {

    return Object.keys(preguntasPorLetra).map(letra => {

        const opciones = preguntasPorLetra[letra];

        const aleatoria =
            opciones[Math.floor(Math.random() * opciones.length)];

        return {
            letra,
            ...aleatoria,
            estado: "pendiente"
        };

    });

}