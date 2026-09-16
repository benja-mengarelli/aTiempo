import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix conocido: sin esto el ícono del pin no carga bien con Vite/Webpack
// (Leaflet calcula mal la ruta a sus propias imágenes por default).
const iconoPorDefecto = L.icon({
    iconUrl,
    shadowUrl: iconShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = iconoPorDefecto;

// Centro por defecto si todavía no hay coordenadas guardadas (Córdoba capital).
const CENTRO_CORDOBA = { lat: -31.4201, lng: -64.1888 };

function ClicksDelMapa({ onCambiarPosicion }) {
    useMapEvents({
        click(e) {
            onCambiarPosicion(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Recentra el mapa si las coordenadas cambian desde afuera 
function RecentrarMapa({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [map]); // solo al montar - si no, cada drag del pin recentraría el mapa de golpe
    return null;
}

export default function MapaSeleccionCoordenadas({ latitud, longitud, rangoMetros, onCambiarPosicion }) {
    const editable = true;
    const posicion = [latitud ?? CENTRO_CORDOBA.lat, longitud ?? CENTRO_CORDOBA.lng];

    return (
        <div style={{ height: 300, width: "100%", borderRadius: 15, overflow: "hidden" }}>
            <MapContainer center={posicion} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Circle center={[latitud, longitud]} radius={rangoMetros} />
                <Marker
                    position={posicion}
                    draggable={editable}
                    eventHandlers={
                        editable
                            ? {
                                dragend: (e) => {
                                    const { lat, lng } = e.target.getLatLng();
                                    onCambiarPosicion(lat, lng);
                                },
                            }
                            : undefined
                    }
                />
                {editable && <ClicksDelMapa onCambiarPosicion={onCambiarPosicion} />}
                <RecentrarMapa lat={posicion[0]} lng={posicion[1]} />
            </MapContainer>
        </div>
    );
}
