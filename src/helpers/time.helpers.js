// DISTANCIA A PUNTO DE REFERENCIA
const toRad = (v) => (v * Math.PI) / 180;

export const distanciaEntreCoordenadas = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; //METROS
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// FORMATEAR TIEMPO Y REDONDEAR 15 MINUTOS ARRIBA
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
