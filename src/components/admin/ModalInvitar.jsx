import { useCodigosEmpresa } from "../../hooks/useCodigosEmpresa";
import { canjearCodigo, generarCodigoUnirse } from "../../services/codigos.service";
import Modal from "../layout/Modal";
import { useState } from "react";

export default function ModalInvitar({ empresaId, nombreEmpresa, uid, cerrar }) {
    const { codigos } = useCodigosEmpresa(empresaId);
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState("");
    const [ultimo, setUltimo] = useState("");

    const generar = async () => {
        setGenerando(true);
        setError("");
        try {
            setUltimo(await generarCodigoUnirse(empresaId, nombreEmpresa, uid));
        } catch (err) {
            console.error("Error al generar código", err);
            setError(err.message || "No se pudo generar el código.");
        } finally {
            setGenerando(false);
        }
    };

    return (
        <Modal titulo="Agregar usuario" cerrar={cerrar}>
            <p className="texto-suave">Generá un código y compartilo para que se una a {nombreEmpresa}.</p>

            <button className="btn btn-primario" onClick={generar} disabled={generando}>
                {generando ? "Generando..." : "Generar código"}
            </button>
            {error && <p className="error">{error}</p>}

            {ultimo && (
                <div className="codigo-generado">
                    <code>{ultimo}</code>
                    <button className="btn btn-glass btn-chico" onClick={() => navigator.clipboard.writeText(ultimo)}>
                        Copiar
                    </button>
                </div>
            )}

            <h4>Códigos generados</h4>
            {codigos.length === 0 ? (
                <p className="vacio">Todavía no generaste ningún código.</p>
            ) : (
                <div className="lista-codigos">
                    {codigos.map((c) => (
                        <div key={c.id} className="codigo-fila">
                            <code>{empresaId}-{c.id}</code>
                            <span className={`chip ${c.usado ? "chip-medio" : "chip-ok"}`}>
                                {c.usado ? "Usado" : "Sin usar"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}