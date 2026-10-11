import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import PantallaCarga from "../layout/PantallaCarga";
import MapaSeleccionCoordenadas from "../layout/MapaSeleccionCoordenedas";
import { useConfiguracionEmpresa } from "../../hooks/useConfiguracionEmpresa";

const OPCIONES_REDONDEO = [0, 15, 30];
const CENTRO_CORDOBA = { latitud: -31.4201, longitud: -64.1888 };

export default function Configuracion() {
    const { rolActual, empresaActivaId, cargando: cargandoAuth } = useAuth();
    const { configuracion, cargandoConfiguracion, actualizarConfiguracionEmpresa } = useConfiguracionEmpresa(empresaActivaId);

    const esAdmin = rolActual === "admin";

    const [latitud, setLatitud] = useState(null);
    const [longitud, setLongitud] = useState(null);
    const [rangoMetros, setRangoMetros] = useState(100);
    const [redondeoMinutos, setRedondeoMinutos] = useState(15);
    const [minimoHS, setMinimoHS] = useState(0)
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);

    // Sincronizamos el form con lo que llega de Firestore (al entrar, o si
    // otro admin lo actualiza mientras esta pantalla sigue abierta).
    useEffect(() => {
        if (!configuracion) return;
        setLatitud(configuracion.coordenadas?.latitud ?? CENTRO_CORDOBA.latitud);
        setLongitud(configuracion.coordenadas?.longitud ?? CENTRO_CORDOBA.longitud);
        setRedondeoMinutos(configuracion.redondeoMinutos ?? 15);
        setRangoMetros(configuracion.rangoMetros ?? 100)
        setMinimoHS(configuracion.minimoHS ?? 0)
    }, [configuracion]);

    if (cargandoAuth || cargandoConfiguracion) return <PantallaCarga />;


    //! cambiar por render condicional: 
    // Si no hay empresa activa, elegir una
    if (!empresaActivaId) {
        return <p>No pertenecés a ninguna empresa todavía.</p>;
    }

    const handleGuardar = async (e) => {
        e.preventDefault();
        setError("");
        setExito(false);

        const lat = Number(latitud);
        const lng = Number(longitud);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            setError("Las coordenadas tienen que ser números válidos.");
            return;
        }

        setGuardando(true);
        try {
            await actualizarConfiguracionEmpresa({
                coordenadas: { latitud: lat, longitud: lng },
                rangoMetros: Number(rangoMetros),
                redondeoMinutos: Number(redondeoMinutos),
                minimoHS: Number(minimoHS)
            });
            setExito(true);
        } catch (err) {
            console.error("Error al guardar configuración", err);
            setError("No se pudo guardar la configuración. Probá de nuevo.");
        } finally {
            setGuardando(false);
        }
    };

    // ---- Vista editable (admin) ----
    return (
        <div className="configuracion-empresa">
            <form onSubmit={handleGuardar}>
                <h2>Configuración de la empresa {configuracion?.nombre || ""}</h2>
                <fieldset>
                    <legend>Coordenadas (para validar ubicación al fichar) </legend>
                    <label>
                        <MapaSeleccionCoordenadas
                            rangoMetros={rangoMetros}
                            latitud={latitud}
                            longitud={longitud}
                            onCambiarPosicion={(lat, lng) => {
                                setLatitud(lat);
                                setLongitud(lng);
                            }}
                        />
                    </label>
                </fieldset>

                <fieldset>
                    <legend>Rango de distancia permitido (metros)</legend>
                    <input
                        type="number"
                        value={rangoMetros}
                        onChange={(e) => setRangoMetros(Number(e.target.value))}
                        min={150}
                    />
                </fieldset>

                <fieldset>
                    <legend>Redondeo de jornadas</legend>
                    <select
                        value={redondeoMinutos}
                        onChange={(e) => setRedondeoMinutos(Number(e.target.value))}
                    >
                        {OPCIONES_REDONDEO.map((min) => (
                            <option key={min} value={min}>{min} minutos</option>
                        ))}
                    </select>
                </fieldset>

                <fieldset>
                    <legend>Minimo de horas por jornada (Min: 0hs - Max: 8hs )</legend>
                    <input
                        type="number"
                        value={minimoHS}
                        onChange={(e) => setMinimoHS(Number(e.target.value))}
                        min={0}
                        max={8}
                        step={0.5}
                    />
                </fieldset>

                {error && <p style={{ color: "red" }}>{error}</p>}
                {exito && <p style={{ color: "green" }}>Configuración guardada.</p>}

                <button type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar cambios"}
                </button>

            </form>

        </div>
    );
}
