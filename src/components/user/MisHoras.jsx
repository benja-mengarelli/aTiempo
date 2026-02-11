import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HoursViewer from "../hours/HoursViewer";

export default function MisHoras() {
    const { id } = useParams();
    const { user, cargando } = useAuth();

    if (cargando) return <div>Cargando...</div>;

    if (!user || !id || user.uid !== id) {
        alert("No tienes permiso para ver esta página.");
        return <Navigate to="/" replace />;
    }

    return <HoursViewer userId={user.uid} />;
}