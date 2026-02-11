import { Link } from "react-router-dom";

export function Navbar({user, onlogout}) {
    return (
        <nav className="navbar">
            <Link to="/">🚹 Bienvenido, {user?.nombre}</Link>
            {user?.rol === "admin" && <button> <Link to="/admin">Panel Admin</Link> </button>}
            {user?.rol === "usuario" && <button> <Link to={`/user/${user.uid}`}>Mis Horas</Link> </button>}
            <button onClick={() => {onlogout()}}>
                ✖️Salir
            </button> 
        </nav>
    );
}