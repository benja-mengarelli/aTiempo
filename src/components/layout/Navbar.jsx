import { Link } from "react-router-dom";

export function Navbar({user, onlogout}) {
    return (
        <nav className="navbar">
            <Link to="/">🚹 Bienvenido, {user?.nombre}</Link>
            {user?.rol === "admin" && <Link to="/admin">Panel Admin</Link>}
            {user?.rol === "usuario" && <Link to={`/user/${user.uid}`}>Mis Horas</Link>}
            <button onClick={() => {onlogout()}}>
                ✖️Salir
            </button> 
        </nav>
    );
}