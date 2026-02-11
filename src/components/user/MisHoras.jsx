import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { getMesesDisponibles, horasFiltradas, agruparPor15Dias, agruparPorSemana, sumarDuracion } from "../../helpers/jornada.helpers";

export default function MisHoras() {
    const FECHA_INICIO = new Date("2025-10-01");
    const { id } = useParams();
    const { user, cargando } = useAuth();
    const [horas, setHoras] = useState([]);
    const [total, setTotal] = useState(0);
    const [mes, setMes] = useState("");
    const [tipoVisualizacion, setTipoVisualizacion] = useState("mes");
    const meses = getMesesDisponibles(FECHA_INICIO);

    // Esperar a auth (cambiar por pantalla carga)
    if (cargando) {
        return <div>Cargando...</div>;
    }

    // Mandar al user a su casa si intenta algo raro
    if (!user || !id || user.uid !== id) {
        alert("No tienes permiso para ver esta página.");
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        // Calcular total de horas cada vez que cambian las horas o el mes
        const filtradas = horasFiltradas(horas, mes);
        const totalDuracion = sumarDuracion(filtradas);
        setTotal(totalDuracion);
    
        // mes por default
        if (!mes && meses.length > 0) {
            setMes(meses[0].value);
        }
    }, [meses, mes]);

    useEffect(() => {
        const q = query(
            collection(db, "users", id, "jornadas"),
            orderBy("fecha", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("Fetched jornadas count:", snapshot.docs.length);
            console.log("Jornadas data:", snapshot.docs.map(doc => doc.data()));

            const jornadasData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                fecha: doc.data().fecha
            }))

            console.log("Processed horas:", jornadasData);
            setHoras(jornadasData);
        });

        return () => unsubscribe();
    }, [id]);

    function renderPorMes() {
        const filtradas = horasFiltradas(horas, mes);

        return (
            <div className="registro-por-mes">
                <h3>Registros del mes (Total: {`${total}`})</h3>
                {filtradas.length === 0 ? (
                    <p>No hay registros para este mes.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Inicio</th>
                                <th>Fin</th>
                                <th>Duración</th>
                                <th>Mensaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map(h => (
                                <tr key={h.id}>
                                    <td>{h.fecha}</td>
                                    <td>{h.inicio}</td>
                                    <td>{h.fin}</td>
                                    <td>{h.duracion}</td>
                                    <td>{h.mensaje}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    }

    function renderPor15Dias() {
        const filtradas = horasFiltradas(horas, mes);
        const agrupadas = agruparPor15Dias(filtradas);

        return (
            <div className="registro-por-quincena">
                <h3>Registros por 15 días</h3>
                <div className="registro-por-quincena-contenedor">
                    <div >
                        <h4>Días 1-15 (Total: {agrupadas.totalPrimera15})</h4>
                        {agrupadas.primera15.length === 0 ? (
                            <p>No hay registros.</p>
                        ) : (
                            <ul>
                                {agrupadas.primera15.map(h => (
                                    <li key={h.id} style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                        <strong>{h.fecha}</strong> - {h.inicio} a {h.fin} ({h.duracion})
                                        <br />
                                        <small>{h.mensaje}</small>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div >
                        <h4>Días 16-31 (Total: {agrupadas.totalSegunda15})</h4>
                        {agrupadas.segunda15.length === 0 ? (
                            <p>No hay registros.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {agrupadas.segunda15.map(h => (
                                    <li key={h.id} style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                        <strong>{h.fecha}</strong> - {h.inicio} a {h.fin} ({h.duracion})
                                        <br />
                                        <small>{h.mensaje}</small>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    function renderPorSemanas() {
        const filtradas = horasFiltradas(horas, mes);
        const semanas = agruparPorSemana(filtradas);

        return (
            <div>
                <h3>Registros por semana</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {[semanas.semana1, semanas.semana2, semanas.semana3, semanas.semana4].map((semana, idx) => (
                        <div key={idx} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
                            <h4>Semana {idx + 1} (Días {semana.dias}) - Total: {semana.total}</h4>
                            {semana.horas.length === 0 ? (
                                <p>No hay registros.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {semana.horas.map(h => (
                                        <li key={h.id} style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#f9f9f9', borderRadius: '3px' }}>
                                            <strong>{h.fecha}</strong> - {h.inicio} a {h.fin} ({h.duracion})
                                            <br />
                                            <small>{h.mensaje}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mis-horas">
            {/* Filtros */}
            <div className="filtros">
                <div className="visualizacion-fechas">
                    {meses.map(m => (
                        <button
                            key={m.value}
                            onClick={() => setMes(m.value)}
                            style={{
                                backgroundColor: mes === m.value ? "#007bff" : "#ddd",
                                color: mes === m.value ? "white" : "black",
                                transform: mes === m.value ? "scale(1.1)" : "none",
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* visualizacion */}
                <div className="visualizacion-horas">
                    <button
                        onClick={() => setTipoVisualizacion("mes")}
                        style={{
                            backgroundColor: tipoVisualizacion === "mes" ? "#007bff" : "#ddd",
                            color: tipoVisualizacion === "mes" ? "white" : "black",
                            transform: tipoVisualizacion === "mes" ? "scale(1.1)" : "none"
                        }}
                    >
                        Mes
                    </button>
                    <button
                        onClick={() => setTipoVisualizacion("15dias")}
                        style={{
                            backgroundColor: tipoVisualizacion === "15dias" ? "#007bff" : "#ddd",
                            color: tipoVisualizacion === "15dias" ? "white" : "black",
                            transform: tipoVisualizacion === "15dias" ? "scale(1.1)" : "none"
                        }}
                    >
                        15 Días
                    </button>
                    <button
                        onClick={() => setTipoVisualizacion("semanas")}
                        style={{
                            backgroundColor: tipoVisualizacion === "semanas" ? "#007bff" : "#ddd",
                            color: tipoVisualizacion === "semanas" ? "white" : "black",
                            transform: tipoVisualizacion === "semana" ? "scale(1.1)" : "none"
                        }}
                    >
                        Semana
                    </button>
                </div>

            </div>

            {/* renderizado condicional */}
            <div>
                {tipoVisualizacion === "mes" && renderPorMes()}
                {tipoVisualizacion === "15dias" && renderPor15Dias()}
                {tipoVisualizacion === "semanas" && renderPorSemanas()}
            </div>
        </div>
    );
}