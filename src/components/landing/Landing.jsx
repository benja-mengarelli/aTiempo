import { Navigate, useNavigate } from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
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
        <div className="landing-container">
            <h1>Bienvenido a la aplicación de gestión de horas</h1>
            <p>Por favor, inicie sesión para continuar.</p>
            <button onClick={redirectToLogin}>Iniciar sesión</button>
        </div>
    );
}