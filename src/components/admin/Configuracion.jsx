import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import PantallaCarga from "../layout/PantallaCarga";
import MapaSeleccionCoordenadas from "../layout/MapaSeleccionCoordenedas";

const OPCIONES_REDONDEO = [0, 5, 10, 15, 30];
const CENTRO_CORDOBA = { latitud: -31.4201, longitud: -64.1888 };

export default function Configuracion() {
    const {
        rolActual,
        empresaActivaId,
        configuracionEmpresa,
        cargandoConfiguracion,
        cargando: cargandoAuth,
        actualizarConfiguracionEmpresa,
    } = useAuth();

    const esAdmin = rolActual === "admin";

    const [latitud, setLatitud] = useState(configuracionEmpresa?.coordenadas?.latitud ?? CENTRO_CORDOBA.latitud);
    const [longitud, setLongitud] = useState(configuracionEmpresa?.coordenadas?.longitud ?? CENTRO_CORDOBA.longitud);
    const [rangoMetros, setRangoMetros] = useState(100);
    const [redondeoMinutos, setRedondeoMinutos] = useState(15);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);

    // Sincronizamos el form con lo que llega de Firestore (al entrar, o si
    // otro admin lo actualiza mientras esta pantalla sigue abierta).
    useEffect(() => {
        if (!configuracionEmpresa) return;
        setLatitud(configuracionEmpresa.coordenadas?.latitud ?? CENTRO_CORDOBA.latitud);
        setLongitud(configuracionEmpresa.coordenadas?.longitud ?? CENTRO_CORDOBA.longitud);
        setRedondeoMinutos(configuracionEmpresa.redondeoMinutos ?? 15);
    }, [configuracionEmpresa]);

    // si solo chequeáramos cargandoConfiguracion, esta pantalla
    // podría montarse ANTES de que empresaActivaId esté resuelto (ese efecto
    // ni arrancó todavía) y mostraría "no configurada" en falso. Por eso
    // esperamos también el cargando principal del auth.
    if (cargandoAuth || cargandoConfiguracion) return <PantallaCarga />;

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
                <h2>Configuración de la empresa {configuracionEmpresa?.nombre || ""}</h2>
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

                {error && <p style={{ color: "red" }}>{error}</p>}
                {exito && <p style={{ color: "green" }}>Configuración guardada.</p>}

                <button type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar cambios"}
                </button>

            </form>

        </div>
    );
}
