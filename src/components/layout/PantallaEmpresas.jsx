import { useAuth } from '../../context/AuthContext';
import PantallaCarga from "../layout/PantallaCarga";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { canjearCodigo, generarCodigoUnirse } from '../../services/codigos.service';
import { useCodigosEmpresa } from '../../hooks/useCodigosEmpresa';
import Modal from './Modal';

export default function PantallaEmpresas() {
    const { user, datos, empresas, refrescarEmpresas, cargando } = useAuth();
    const navigate = useNavigate();

    const [mostrarAgregar, setMostrarAgregar] = useState(false);
    const [codigoInput, setCodigoInput] = useState("");
    const [canjeando, setCanjeando] = useState(false);
    const [errorCanje, setErrorCanje] = useState("");

    const irAEmpresa = (empresaId) => navigate(`/empresas/${empresaId}`);

    const cerrarModal = () => {
        setMostrarAgregar(false);
        setCodigoInput("");
        setErrorCanje("");
    };

    const handleCanjear = async (e) => {
        e.preventDefault();
        setErrorCanje("");
        setCanjeando(true);
        try {
            const empresaId = await canjearCodigo(codigoInput, user, datos?.nombre || "");
            await refrescarEmpresas(); // sin esto la empresa nueva no está en la lista y el layout la rechaza
            cerrarModal();
            irAEmpresa(empresaId);
        } catch (err) {
            console.error("Error al canjear código", err);
            setErrorCanje(err.message || "No se pudo canjear el código.");
        } finally {
            setCanjeando(false);
        }
    };

    if (cargando) return <PantallaCarga />;

    return (
        <div className="pantalla-empresas">
            <h2 className="titulo-pantalla">Tus empresas</h2>

            <div className="grid-boxes scroll-x">
                {empresas.map((e) => (
                    <button key={e.id} className="box glass" onClick={() => irAEmpresa(e.id)}>
                        <div className="box-avatar">{e.nombre?.[0]}</div>
                        <strong>{e.nombre}</strong>
                        <span className="box-rol">{e.rol === "admin" ? "Admin" : "Usuario"}</span>
                    </button>
                ))}

                <button className="box box-agregar" onClick={() => setMostrarAgregar(true)}>
                    <span className="mas">+</span>
                    <strong>Agregar empresa</strong>
                </button>
            </div>

            {mostrarAgregar && (
                <Modal titulo="Unirme a una empresa" cerrar={cerrarModal}>
                    <p className="texto-suave">Ingresá el código que te pasó el administrador.</p>
                    <form onSubmit={handleCanjear} className="form-modal">
                        <input className="input" type="text" value={codigoInput} autoFocus required
                            onChange={(e) => setCodigoInput(e.target.value)}
                            placeholder="Código de invitación" disabled={canjeando} />
                        {errorCanje && <p className="error">{errorCanje}</p>}
                        <div className="acciones-modal">
                            <button type="button" className="btn btn-glass" onClick={cerrarModal}>Cancelar</button>
                            <button type="submit" className="btn btn-primario" disabled={canjeando}>
                                {canjeando ? "Procesando..." : "Ingresar"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}