import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PantallaCarga from "../layout/PantallaCarga";

export default function Landing() {
    const { user, datos, cargando } = useAuth();
    const navigate = useNavigate();

    const redirectToLogin = () => {
        console.log("Redirigiendo a la página de login...");
        navigate("/login");
    }
    console.log("Landing.jsx - user:", user);
    console.log("Landing.jsx - datos:", datos);
    if (cargando) return <PantallaCarga />;

    if (user && datos?.rol == "superAdmin") return <Navigate to="/superUser" replace />;
    if (user && datos?.rol == "admin" || datos?.rol == "usuario") return <Navigate to="/empresas" replace />;

    //! LANDING VA A RENDERIZAR COMPONENTES Y EL BOTON UNICAMENTE
    return (
        <main className="landing">
            <section className="landing-hero">
                <span className="landing-badge">Control de jornadas</span>
                <h1>Gestioná las horas de tu equipo <span className="grad">sin vueltas</span></h1>
                <p>Fichá entrada y salida desde cualquier dispositivo, pedí correcciones y
                    seguí las métricas de cada empresa en un solo lugar.</p>
                <div className="landing-cta">
                    <button className="btn btn-primario" onClick={redirectToLogin}>Inicias Sesion / Registrarse</button>
                </div>
            </section>

            <section className="landing-features">
                <article className="glass feature"><span>⏱️</span><h3>Fichaje en tiempo real</h3><p>Sincronizado entre dispositivos.</p></article>
                <article className="glass feature"><span>📝</span><h3>Peticiones</h3><p>Pedí altas, ediciones o bajas de jornadas.</p></article>
                <article className="glass feature"><span>📊</span><h3>Métricas</h3><p>Totales y reportes para admins.</p></article>
            </section>
        </main>
    );
}