import { useAuth } from '../../context/AuthContext';
import PantallaCarga from "../layout/PantallaCarga";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { canjearCodigo, generarCodigoUnirse } from '../../services/codigos.service';
import { useCodigosEmpresa } from '../../hooks/useCodigosEmpresa';

export default function PantallaEmpresas() {

    const { user, datos, empresas, refrescarEmpresas, cargando } = useAuth();
    const navigate = useNavigate();

    // ---- Canjear código ----
    const [codigoInput, setCodigoInput] = useState("");
    const [canjeando, setCanjeando] = useState(false);
    const [errorCanje, setErrorCanje] = useState("");

    // ---- Generar código (solo si es admin de alguna empresa) ----
    const empresasAdmin = empresas.filter((e) => e.rol === "admin");
    const [empresaParaCodigo, setEmpresaParaCodigo] = useState(empresasAdmin[0]?.id || "");
    const [generando, setGenerando] = useState(false);
    const [errorGenerar, setErrorGenerar] = useState("");
    const [ultimoCodigoGenerado, setUltimoCodigoGenerado] = useState("");

    const { codigos } = useCodigosEmpresa(empresaParaCodigo);

    const redirectToEmpresa = (empresaId) => {
        navigate(`/empresas/${empresaId}`);
    }

    const handleCanjear = async (e) => {
        e.preventDefault();
        setErrorCanje("");
        setCanjeando(true);
        try {
            const empresaId = await canjearCodigo(codigoInput, user, datos?.nombre || "");
            setCodigoInput("");
            await refrescarEmpresas(); // sin esto la empresa nueva no está en la lista y el layout la rechaza
            irAEmpresa(empresaId);
        } catch (err) {
            console.error("Error al canjear código", err);
            setErrorCanje(err.message || "No se pudo canjear el código.");
        } finally {
            setCanjeando(false);
        }
    };

    const handleGenerarCodigo = async () => {
        if (!empresaParaCodigo) return;
        setGenerando(true);
        setErrorGenerar("");
        try {
            const nombreEmpresa = empresasAdmin.find((e) => e.id === empresaParaCodigo)?.nombre || "";
            const codigoCompleto = await generarCodigoUnirse(empresaParaCodigo, nombreEmpresa, user.uid);
            setUltimoCodigoGenerado(codigoCompleto);
        } catch (err) {
            console.error("Error al generar código", err);
            setErrorGenerar(err.message || "No se pudo generar el código.");
        } finally {
            setGenerando(false);
        }
    };


    if (cargando) return <PantallaCarga />;

    return (
        <div className="pantalla-empresas">
            <h2>Tus empresas</h2>

            {empresas.length === 0 ? (
                <p>Todavía no pertenecés a ninguna empresa.</p>
            ) : (
                <ul className="lista-empresas">
                    {empresas.map((e) => (
                        <li key={e.id}>
                            <button onClick={() => redirectToEmpresa(e.id)}>
                                {e.nombre}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <section className="ingresar-codigo">
                <h3>¿Tenés un código?</h3>
                <form onSubmit={handleCanjear}>
                    <input
                        type="text"
                        value={codigoInput}
                        onChange={(e) => setCodigoInput(e.target.value)}
                        placeholder="Ingresá el código"
                        disabled={canjeando}
                        required
                    />
                    <button type="submit" disabled={canjeando}>
                        {canjeando ? "Procesando..." : "Ingresar"}
                    </button>
                </form>
                {errorCanje && <p className="error">{errorCanje}</p>}
            </section>

            {empresasAdmin.length > 0 && (
                <section className="generar-codigo">
                    <h3>Invitar a un usuario</h3>

                    {empresasAdmin.length > 1 && (
                        <select
                            value={empresaParaCodigo}
                            onChange={(e) => setEmpresaParaCodigo(e.target.value)}
                        >
                            {empresasAdmin.map((e) => (
                                <option key={e.id} value={e.id}>{e.nombre}</option>
                            ))}
                        </select>
                    )}

                    <button onClick={handleGenerarCodigo} disabled={generando}>
                        {generando ? "Generando..." : "Generar código"}
                    </button>
                    {errorGenerar && <p className="error">{errorGenerar}</p>}
                    {ultimoCodigoGenerado && (
                        <p className="codigo-generado">
                            Código para compartir: <strong>{ultimoCodigoGenerado}</strong>
                        </p>
                    )}

                    <h4>Códigos generados</h4>
                    {codigos.length === 0 ? (
                        <p>Todavía no generaste ningún código.</p>
                    ) : (
                        <ul className="lista-codigos">
                            {codigos.map((c) => (
                                <li key={c.id}>
                                    {empresaParaCodigo}-{c.id} — {c.usado ? "Usado" : "Sin usar"}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </div>
    );
}