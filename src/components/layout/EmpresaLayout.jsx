import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PantallaCarga from "../layout/PantallaCarga";

/**
 * Ruta padre de todo lo que vive bajo /empresa/:empresaId/...
 *
 *   <Route path="/empresa/:empresaId" element={<EmpresaLayout />}>
 *       <Route path="admin" element={<Admin />} />
 *       <Route path="user" element={<User />} />
 *       ...
 *   </Route>
 *
 * - Entrar al subárbol: pone empresaActivaId = el :empresaId de la URL
 *   (así también funciona al recargar la página con F5).
 * - Salir del subárbol (volver a /empresas, a la landing, a cualquier otra
 *   ruta): el cleanup lo vuelve a null. Un solo lugar, sin importar por
 *   dónde se vaya.
 * - Si la URL tiene una empresa a la que no pertenece: lo manda a /empresas.
 * - Los hijos solo se montan cuando el context ya refleja la empresa de la
 *   URL, así nunca ven rolActual en null por una carrera.
 */
export default function EmpresaLayout() {
    const { empresaId } = useParams();
    const {
        user,
        empresas,
        cargando,
        empresaActivaId,
        cambiarEmpresaActiva,
        salirDeEmpresa,
    } = useAuth();

    const pertenece = empresas.some((e) => e.id === empresaId);

    useEffect(() => {
        if (cargando || !user || !pertenece) return;
        cambiarEmpresaActiva(empresaId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cargando, user, pertenece, empresaId]);

    useEffect(() => {
        return () => salirDeEmpresa();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (cargando) return <PantallaCarga />;
    if (!user || !pertenece) return <Navigate to="/empresas" replace />;
    if (empresaActivaId !== empresaId) return <PantallaCarga />;

    return <Outlet />;
}
