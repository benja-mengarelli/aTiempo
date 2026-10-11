import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {

    const { user, datos, logout, empresaActivaId, rolActual } = useAuth();

    const [darkMode, setDarkMode] = useState(() => {
        //! Verificar local storage
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const handleThemeToggle = () => {
        setDarkMode((prev) => !prev);
    };

    return (
        <div className="caja-navbar">
            <nav className="navbar">
                <Link to="/empresas"><span>{datos?.nombre[0]}</span></Link>
                {rolActual === "admin" && empresaActivaId && (
                    <Link to={`/empresas/${empresaActivaId}/admin/configuracion`} className="btn-mis-horas">⚙️</Link>
                )}

                {rolActual === "usuario" && empresaActivaId && (
                    <Link to={`/empresas/${empresaActivaId}/user/misHoras/${user.uid}`} className="btn-mis-horas">📆</Link>
                )}
                {/* <bu|tton> <Link to={`/juego`} >🕹️</Link> </bu|tton> */}
                <button onClick={handleThemeToggle} aria-label="Cambiar tema">
                    {darkMode ? "🌙" : "☀️"}
                </button>
                <button onClick={() => { logout(); }}><Link to="/">✖️Salir</Link></button>
            </nav>
        </div>
    );
}