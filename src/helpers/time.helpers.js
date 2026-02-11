// FORMATEAR TIEMPO EN HH:MM
export const formatearTiempo = (segundos) => {
    let hrs = Math.floor(segundos / 3600);
    let mins = Math.floor((segundos % 3600) / 60);
    // Segun el cuarto de hora, redondear
    const minRedondeado = mins > 45 ? 0 : mins > 30 ? 45 : mins > 15 ? 30 : mins >= 0 ? 15 : 0;
    if (minRedondeado === 0 && mins > 45) {
        hrs += 1;
        mins = 0;
    } else {
        mins = minRedondeado;
    }
    // retornar en formato HH:MM
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

//Contabilizar horas / redondeado a horas
export const contabilizarHoras = (segundos) => {
    let hrs = Math.floor(segundos / 3600);
    let mins = Math.floor((segundos % 3600) / 60);
    
    hrs += mins > 45 ? 1 : mins > 30 ? 0.75 : mins > 15 ? 0.5 : mins >= 0 ? 0.25 : 0;

    return hrs < 2.5 ? 2.5 : hrs;
};

// OBTENER TIEMPO ACTUAL EN SEGUNDOS Respecto al inicio
export const obtenerTiempoActualEnSegundos = (inicioTimer) => {
    if (!inicioTimer) return "00:00:00";
    const inicioMs = inicioTimer instanceof Date ? inicioTimer.getTime() : Number(inicioTimer);
    if (isNaN(inicioMs)) return "00:00:00";
    let diff = Math.max(0, Math.floor((Date.now() - inicioMs) / 1000));
    const hrs = Math.floor(diff / 3600);
    diff = diff % 3600;
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
