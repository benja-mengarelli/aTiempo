import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HoursViewer from "../hours/HoursViewer";

export default function VerHoras() {
    const { id } = useParams();
    const { user, datos, cargando } = useAuth();

    if (cargando) return <div>Cargando...</div>

    if (!user || !id || datos.rol !== "admin") {
        alert("No tienes permiso para ver esta pagina")
        return <Navigate to="/" replace/>
    }


    return <HoursViewer userId={id} />
}