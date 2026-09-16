import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function Navbar({ user, onlogout }) {
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
                <Link to="/"><span>{user?.nombre[0]}</span></Link>
                {user?.rol === "admin" && (
                    <Link to={"/admin/configuracion"} className="btn-mis-horas">⚙️</Link>
                )}

                {user?.rol === "usuario" && (
                    <Link to={`/user/${user.uid}`} className="btn-mis-horas">📆</Link>
                )}
                {/* <bu|tton> <Link to={`/juego`} >🕹️</Link> </bu|tton> */}
                <button onClick={handleThemeToggle} aria-label="Cambiar tema">
                    {darkMode ? "🌙" : "☀️"}
                </button>
                <button onClick={() => { onlogout(); }}><Link to="/">✖️Salir</Link></button>
            </nav>
        </div>
    );
}