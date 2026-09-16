import { useEffect, useState } from "react";
import { useJornadaActiva } from "../../context/jornadaContext";
import { useAuth } from "../../context/AuthContext";
import PantallaCarga from "../layout/PantallaCarga";
import FormSolicitarJornada from "./FormSolicitarJornada";
import FormEditarJornada from "./FormEditarJornada";
import FormEliminarJornada from "./FormEliminarJornada";
import { crearPeticion } from "../../services/peticiones.service"
import { usePeticionesUsuario } from "./UsePeticionesUser";

export default function User() {
    const {
        jornadaActiva,
        cargando,
        procesando,
        iniciarJornada,
        finalizarJornada,
    } = useJornadaActiva();
    const { user, datos, empresaActivaId } = useAuth();


    const [mostrarFormSolicitar, setMostrarFormSolicitar] = useState(false);
    const [mostrarFormEditar, setMostrarFormEditar] = useState(false);
    const [mostrarFormEliminar, setMostrarFormEliminar] = useState(false);
    const [tiempo, setTiempo] = useState(0);
    const { peticiones, contarPorTipo } = usePeticionesUsuario(empresaActivaId, user?.uid);


    const solicitarJornada = ({ fecha, payload, mensaje }) => {
        crearPeticion(empresaActivaId, user.uid, datos.nombre, "agregar", { fecha, payload, mensaje });
    };
    const editarJornada = ({ fecha, jornadaId, payload, mensaje }) => {
        crearPeticion(empresaActivaId, user.uid, datos.nombre, "editar", { fecha, jornadaId, payload, mensaje });
    };
    const eliminarJornada = ({ fecha, jornadaId, mensaje }) => {
        crearPeticion(empresaActivaId, user.uid, datos.nombre, "eliminar", { fecha, jornadaId, mensaje });
    };


    const inicioTs = jornadaActiva?.inicioTimestamp ? jornadaActiva.inicioTimestamp.toMillis() : null;

    useEffect(() => {
        if (!inicioTs) {
            setTiempo(0);
            return;
        }

        setTiempo(Date.now() - inicioTs);
        const intervalo = setInterval(() => {
            setTiempo(Date.now() - inicioTs);
        }, 1000);

        return () => clearInterval(intervalo);
    }, [inicioTs]);

    if (cargando || procesando) return <PantallaCarga />;

    return (
        <div className="manejo-jornada" >
            <div className="arrancar-jornada" style={{ backgroundColor: jornadaActiva ? "#ff4d4d85" : "none" }}>
                <h2>
                    {jornadaActiva ? "Jornada corriendo" : "Iniciar jornada"}
                </h2>

                <button
                    onClick={jornadaActiva ? finalizarJornada : iniciarJornada}
                    disabled={cargando || procesando}
                >
                    {jornadaActiva ? "⏸️Finalizar" : "▶️Iniciar"}
                </button>
                <p>
                    {inicioTs ? obtenerTiempoActualEnSegundos(inicioTs) : "00:00:00"}
                </p>
            </div>

            <div className="solicitar-jornada">
                <h2>
                    {jornadaActiva ? "Ya hay una en curso" : "Solicitar jornada"}
                </h2>
                <button
                    onClick={() => setMostrarFormSolicitar(true)}
                    disabled={cargando || procesando || jornadaActiva || mostrarFormEditar || mostrarFormEliminar}
                    style={{ backgroundColor: "#09a5e785" }}
                >
                    {jornadaActiva ? "⛔Finalizar activa" : "➕Agregar solicitud"}
                </button>
                <p>
                    {"Pendientes de aprobar: " + contarPorTipo("agregar")}
                </p>
            </div>

            <div className="modificar-jornada">
                <h2>
                    {"Modificar jornada"}
                </h2>
                <button
                    onClick={() => setMostrarFormEditar(true)}
                    disabled={cargando || procesando || jornadaActiva || mostrarFormSolicitar || mostrarFormEliminar}
                    style={{ backgroundColor: "#110a9785" }}
                >
                    {jornadaActiva ? "⛔Finalizar activa" : "📜Modificar Jornada"}
                </button>
                <p>
                    {"Pendientes de aprobar: " + contarPorTipo("editar")}
                </p>
            </div>

            <div className="borrar-jornada">
                <h2>
                    {"Borrar jornada"}
                </h2>
                <button
                    onClick={() => setMostrarFormEliminar(true)}
                    disabled={cargando || procesando || jornadaActiva || mostrarFormSolicitar || mostrarFormEditar}
                    style={{ backgroundColor: "#ff4d4d85" }}
                >
                    {jornadaActiva ? "⛔Finalizar activa" : "🗑️Borrar jornada"}
                </button>
                <p>
                    {"Pendientes de aprobar: " + contarPorTipo("eliminar")}
                </p>
            </div>
            {mostrarFormSolicitar && <FormSolicitarJornada guardar={solicitarJornada} cerrar={() => setMostrarFormSolicitar(false)} />}
            {mostrarFormEditar && <FormEditarJornada guardar={editarJornada} cerrar={() => setMostrarFormEditar(false)} />}
            {mostrarFormEliminar && <FormEliminarJornada guardar={eliminarJornada} cerrar={() => setMostrarFormEliminar(false)} />}
        </div>


    );
}