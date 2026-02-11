import { useState } from "react";
import { obtenerUbicacion, distanciaEntreCoordenadas } from "../helpers/geoLocation.helpers";

export default function useGeoLocation(COORDENADAS_CLUB, distanciaMax = 300) {
    const [flagDistancia, setFlagDistancia] = useState(0);

    const verificarDistancia = async () => {
        try {
            const pos = await obtenerUbicacion();

            const distanciaActual = distanciaEntreCoordenadas(
                pos.coords.latitude,
                pos.coords.longitude,
                COORDENADAS_CLUB.latitud,
                COORDENADAS_CLUB.longitud
            );

            const flag = distanciaActual > distanciaMax ? 1 : 0;
            setFlagDistancia(flag);
            return flag; // Return the computed value immediately
        } catch (e) {
            console.error("Error al obtener ubicación:", e);
            setFlagDistancia(3); // Asumir fuera de rango si no se puede obtener ubicación
            return 3;
        }
    };

    return { flagDistancia, verificarDistancia };
}
