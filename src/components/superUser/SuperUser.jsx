import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { generarCodigoCrearEmpresa } from "../../services/codigos.service";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase"; 
import PantallaCarga from "../layout/PantallaCarga";

export default function SuperUser() {
    const { user, cargando } = useAuth();
    

    const [nombreEmpresa, setNombreEmpresa] = useState("");
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState("");
    const [ultimoCodigo, setUltimoCodigo] = useState("");

    const [empresas, setEmpresas] = useState([]);
    const [codigos, setCodigos] = useState([]);

    // Ambas listas en vivo - crear una empresa nueva desde otra pestaña
    // (o canjear un código) se refleja solo, sin refrescar.
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "empresas"),
            (snap) => setEmpresas(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => console.error("Error escuchando empresas:", err)
        );
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "codigosInvitacion"),
            (snap) => setCodigos(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => console.error("Error escuchando códigos:", err)
        );
        return () => unsub();
    }, []);

    const handleGenerar = async (e) => {
        e.preventDefault();
        if (!nombreEmpresa.trim()) {
            setError("Ingresá un nombre de empresa.");
            return;
        }
        setGenerando(true);
        setError("");
        try {
            const codigo = await generarCodigoCrearEmpresa(nombreEmpresa, user.uid);
            setUltimoCodigo(codigo);
            setNombreEmpresa("");
        } catch (err) {
            console.error("Error al generar código", err);
            setError(err.message || "No se pudo generar el código.");
        } finally {
            setGenerando(false);
        }
    };

    const codigosSinUsar = codigos.filter((c) => !c.usado);

    if (cargando) return <PantallaCarga />;

    return (
        <div className="pantalla-superuser">
            <h2>Panel de superAdmin</h2>

            <section>
                <h3>Crear nueva empresa</h3>
                <form onSubmit={handleGenerar}>
                    <input
                        type="text"
                        value={nombreEmpresa}
                        onChange={(e) => setNombreEmpresa(e.target.value)}
                        placeholder="Nombre de la empresa"
                        disabled={generando}
                        required
                    />
                    <button type="submit" disabled={generando}>
                        {generando ? "Generando..." : "Generar código"}
                    </button>
                </form>
                {error && <p className="error">{error}</p>}
                {ultimoCodigo && (
                    <p className="codigo-generado">
                        Código: <strong>{ultimoCodigo}</strong>
                    </p>
                )}
            </section>

            <section>
                <h3>Empresas ({empresas.length})</h3>
                <ul>
                    {empresas.map((e) => (
                        <li key={e.id}>{e.nombre} ({e.id})</li>
                    ))}
                </ul>
            </section>

            <section>
                <h3>Códigos de creación de empresa ({codigosSinUsar.length} sin usar / {codigos.length} total)</h3>
                <ul>
                    {codigos.map((c) => (
                        <li key={c.id}>
                            {c.id} — {c.nombreEmpresa} — {c.usado ? `Usado (empresa: ${c.empresaCreada})` : "Sin usar"}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
