export function Navbar({user, onlogout}) {
    return (
        <nav className="navbar">
            <span>🚹 Bienvenido, {user?.nombre}</span>
            {user?.rol === "admin" && <button> Ver Horas </button>}
            {user?.rol === "usuario" && <button> Mis Horas </button>}
            <button onClick={() => {onlogout()}}>
                ✖️Salir
            </button>
        </nav>
    );
}