import { obtenerUbicacion, distanciaEntreCoordenadas } from "../helpers/geoLocation.helpers";

export default async function useGeoLocation(COORDENADAS, distanciaMax) {
    try {
        const pos = await obtenerUbicacion();
        const distanciaActual = distanciaEntreCoordenadas(
            pos.coords.latitude,
            pos.coords.longitude,
            COORDENADAS.latitud,
            COORDENADAS.longitud
        );
        return distanciaActual > distanciaMax ? 1 : 0; 
    } 
    catch (e) {
        console.error("Error al obtener ubicación:", e);
        return 3
    } 
}
