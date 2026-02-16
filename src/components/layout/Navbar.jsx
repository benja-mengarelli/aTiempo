import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function Navbar({ user, onlogout }) {
    const [darkMode, setDarkMode] = useState(() => {
        // Check localStorage or default to false
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
                <Link to="/"><img src={user?.imagen} alt={user?.nombre} /></Link>
                {/* {user?.rol === "admin" && (
                    <button>
                        <Link to={`/admin/${user.uid}`}>Panel Admin</Link>
                    </button>
                )} */}
                {user?.rol === "usuario" && (
                    <button>
                        <Link to={`/user/${user.uid}`}>Mis Horas</Link>
                    </button>
                )}
                <button onClick={handleThemeToggle} aria-label="Cambiar tema" style={{ fontSize: 22, padding: "0 12px", borderRadius: 20, border: "none", background: "none", cursor: "pointer" }}>
                    {darkMode ? "🌙" : "☀️"}
                </button>
                <button onClick={() => { onlogout(); }}>✖️Salir</button>
            </nav>
        </div>
    );
}