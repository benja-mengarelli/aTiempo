const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function horasPorDiaSemana(jornadas) {
    const resultado = dias.map(d => ({
        dia: d,
        horas: 0
    }));

    jornadas.forEach(j => {
        resultado[j.numeroDiaSemana].horas += Number(j.duracion || 0);
    });

    return resultado;
}

export function jornadasPorDiaSemana(jornadas) {

    const resultado = dias.map(d => ({
        dia: d,
        jornadas: 0
    }));

    jornadas.forEach(j => {
        resultado[j.numeroDiaSemana].jornadas++;
    });

    return resultado;
}

export function evolucionMensual(jornadas) {

    return jornadas
        .map(j => ({
            dia: j.numeroDia,
            horas: Number(j.duracion || 0)
        }))
        .sort((a, b) => a.dia - b.dia);
}

export function resumen(jornadas) {

    if (!jornadas.length)
        return {
            total: 0,
            promedio: 0,
            mayor: 0,
            menor: 0
        };

    const horas = jornadas.map(j => Number(j.duracion || 0));

    return {

        total: horas.reduce((a, b) => a + b, 0),

        promedio:
            horas.reduce((a, b) => a + b, 0) / horas.length,

        mayor: Math.max(...horas),

        menor: Math.min(...horas)

    };
}

export function horasPorEmpleado(jornadas) {

    const resultado = dias.map(d => ({
        dia: d
    }));

    jornadas.forEach(j => {

        const indice = j.numeroDiaSemana;

        if (indice == null) return;

        const nombre = j.nombre || j.user || "Sin nombre";

        resultado[indice][nombre] =
            (resultado[indice][nombre] || 0) +
            Number(j.duracion || 0);

    });

    return resultado;

}

export function intensidadDias(jornadas){

    const resultado=dias.map(d=>({

        dia:d,
        horas:0,
        personas:new Set()

    }));

    jornadas.forEach(j=>{

        const i=j.numeroDiaSemana;

        if(i==null) return;

        resultado[i].horas+=Number(j.duracion||0);

        resultado[i].personas.add(j.uid);

    });

    return resultado.map(d=>({

        dia:d.dia,

        intensidad:
            d.personas.size===0
                ?0
                :d.horas/d.personas.size

    }));

}