import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
    const { user, datos, logout, empresaActivaId, rolActual } = useAuth();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const rutaHome = `/empresas/${empresaActivaId}`;

    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark-mode", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    //! Píldora animada
    const linksRef = useRef(null);
    const [pill, setPill] = useState({ left: 0, width: 0, visible: false, lista: false });

    const medirPill = () => {
        const activo = linksRef.current?.querySelector(".navbar-link.activo");
        if (!activo) {
            setPill((p) => ({ ...p, visible: false }));
            return;
        }
        setPill((p) => ({
            left: activo.offsetLeft,
            width: activo.offsetWidth,
            visible: true,
            lista: p.visible || p.lista, // anima solo después de la primera posición
        }));
    };

    // useLayoutEffect: mide antes del paint, evita parpadeo
    useLayoutEffect(() => {
        medirPill();
    }, [pathname, rolActual, empresaActivaId, datos?.nombre]);

    useEffect(() => {
        window.addEventListener("resize", medirPill);
        return () => window.removeEventListener("resize", medirPill);
    }, []);

    //! Cerrar sesión (antes había un Link dentro de un button, que es HTML inválido)
    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const claseLink = ({ isActive }) => `navbar-link ${isActive ? "activo" : ""}`;

    return (
        <div className="caja-navbar">
            <nav className="navbar glass">
                <div className="navbar-links" ref={linksRef}>
                    <span
                        className={`navbar-pill ${pill.lista ? "animar" : ""}`}
                        style={{
                            transform: `translateX(${pill.left}px)`,
                            width: pill.width,
                            opacity: pill.visible ? 1 : 0,
                        }}
                    />

                    <NavLink to="/empresas" end className={claseLink} aria-label="Empresas">🏢</NavLink>

                    {empresaActivaId && (
                        <NavLink to={rutaHome} end className={claseLink} aria-label="Mi página">
                            <span className="navbar-inicial">{datos?.nombre?.[0]}</span>
                        </NavLink>
                    )}

                    {rolActual === "admin" && empresaActivaId && (
                        <NavLink
                            to={`/empresas/${empresaActivaId}/admin/configuracion`}
                            className={claseLink}
                            aria-label="Configuración"
                        >
                            ⚙️
                        </NavLink>
                    )}

                    {rolActual === "usuario" && empresaActivaId && (
                        <NavLink
                            to={`/empresas/${empresaActivaId}/user/misHoras/${user.uid}`}
                            className={claseLink}
                            aria-label="Mis horas"
                        >
                            📆
                        </NavLink>
                    )}
                </div>

                <div className="navbar-acciones">
                    <button className="navbar-btn" onClick={() => setDarkMode((p) => !p)} aria-label="Cambiar tema">
                        {darkMode ? "🌙" : "☀️"}
                    </button>
                    <button className="navbar-btn navbar-salir" onClick={handleLogout}>
                        ✖️ Salir
                    </button>
                </div>
            </nav>
        </div>
    );
}