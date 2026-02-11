import { sum } from "firebase/firestore";

export function getMesesDisponibles(fechaInicio) {
    const meses = [];
    const fechaActual = new Date();
    
    // parsear fechaInicio si es string, considerando formato "YYYY/MM/DD" o "YYYY-MM-DD"
    let inicio = fechaInicio;
    if (typeof fechaInicio === 'string') {
        inicio = new Date(fechaInicio.replace(/\//g, '-'));
    } else {
        inicio = new Date(fechaInicio);
    }

    // Arrancar desde el primer día del mes actual
    let ahora = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);

    for (let i = 0; i < 6; i++) {
        if (ahora < inicio) break;

        meses.push({
            label: `${ahora.getMonth() + 1}/${ahora.getFullYear()}`,
            value: `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`
        });

        // Volver al mes anterior (parsea el año)
        ahora.setMonth(ahora.getMonth() - 1);
    }

    return meses;
}


export function horasFiltradas (jornadas, mesSeleccionado) {
    // Si no hay mes seleccionado, retornar todas las jornadas
    if (!mesSeleccionado) return jornadas;
    
    // Filtrar jornadas por mes seleccionado (formato "YYYY-MM")
    return jornadas.filter(jornada => {
        // Parse fecha string "YYYY-MM-DD" (from ISO format) or "YYYY/MM/DD"
        const fechaParts = jornada.fecha.includes('-') 
            ? jornada.fecha.split('-') 
            : jornada.fecha.split('/');
        
        const [year, month] = fechaParts;
        const mesJornada = `${year}-${month}`;
        console.log("Comparing:", mesJornada, "with", mesSeleccionado, "Match:", mesJornada === mesSeleccionado);
        return mesJornada === mesSeleccionado;
    })
}

export function agruparPor15Dias(horas) {
    // Retorna un objeto con dos arrays: primera15 y segunda15
    const primera15 = horas.filter(h => {
        const fechaParts = h.fecha.includes('-') ? h.fecha.split('-') : h.fecha.split('/');
        const day = parseInt(fechaParts[2]);
        return day <= 15;
    });
    
    const segunda15 = horas.filter(h => {
        const fechaParts = h.fecha.includes('-') ? h.fecha.split('-') : h.fecha.split('/');
        const day = parseInt(fechaParts[2]);
        return day > 15;
    });
    
    return {
        primera15,
        segunda15,
        totalPrimera15: sumarDuracion(primera15),
        totalSegunda15: sumarDuracion(segunda15)
    };
}

export function agruparPorSemana(horas) {
    // Retorna 4 semanas: 1-7, 8-15, 16-23, 24-31
    const semana1 = horas.filter(h => {
        const fechaParts = h.fecha.includes('-') ? h.fecha.split('-') : h.fecha.split('/');
        const day = parseInt(fechaParts[2]);
        return day >= 1 && day <= 7;
    });
    
    const semana2 = horas.filter(h => {
        const fechaParts = h.fecha.includes('-') ? h.fecha.split('-') : h.fecha.split('/');
        const day = parseInt(fechaParts[2]);
        return day >= 8 && day <= 15;
    });
    
    const semana3 = horas.filter(h => {
        const fechaParts = h.fecha.includes('-') ? h.fecha.split('-') : h.fecha.split('/');
        const day = parseInt(fechaParts[2]);
        return day >= 16 && day <= 23;
    });
    
    const semana4 = horas.filter(h => {
        const fechaParts = h.fecha.includes('-') ? h.fecha.split('-') : h.fecha.split('/');
        const day = parseInt(fechaParts[2]);
        return day >= 24 && day <= 31;
    });
    
    return {
        semana1: { dias: "1-7", horas: semana1, total: sumarDuracion(semana1) },
        semana2: { dias: "8-15", horas: semana2, total: sumarDuracion(semana2) },
        semana3: { dias: "16-23", horas: semana3, total: sumarDuracion(semana3) },
        semana4: { dias: "24-31", horas: semana4, total: sumarDuracion(semana4) }
    };
}

export function sumarDuracion(horas) {
    // Suma la duracion de todas las horas
    return horas.reduce((total, h) => total + (h.duracion || 0), 0);
}