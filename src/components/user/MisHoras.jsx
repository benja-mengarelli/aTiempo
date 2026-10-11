import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HoursViewer from "../hours/HoursViewer";
import PantallaCarga from "../layout/PantallaCarga";

export default function MisHoras() {
    const { id } = useParams();
    const { user, cargando, cargandoConfiguracion } = useAuth();

    if (cargando || cargandoConfiguracion) return <PantallaCarga />;

    if (!user || !id || user.uid !== id) {
        alert("No tienes permiso para ver esta página.");
        return <Navigate to="/" replace />;
    }

    return <HoursViewer userId={user.uid} />;
}