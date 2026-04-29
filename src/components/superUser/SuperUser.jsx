import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import PantallaCarga from '../layout/PantallaCarga';
import { visualizarCodigosInvitacion } from './superUserService';

export function SuperUser({ datos }) {
    const { user } = useAuth();
    const { codigos, cargando, generarCodigoInvitacion } = visualizarCodigosInvitacion();


    if (!user || datos?.rol !== "superAdmin") {
        alert("No tienes permiso para ver esta página.");
        return <Navigate to="/" replace />;
    }

    if (cargando) return <PantallaCarga />;

    return (
        <div>
            <h1>Bienvenido Super Usuario</h1>
            <button onClick={ generarCodigoInvitacion} disabled={cargando}>
                {cargando ? "Generando..." : "Generar Código de Invitación"}
            </button>
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Usado</th>
                        <th>Expiración</th>
                    </tr>
                </thead>
                <tbody>
                    {codigos.map((codigo) => (
                        <tr key={codigo.id}>
                            <td>{codigo.id}</td>
                            <td>{codigo.usado ? "Sí" : "No"}</td>
                            <td>{new Date(codigo.expiracion).toLocaleString()}</td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </div>
    );
}