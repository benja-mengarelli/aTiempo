import { useState } from "react";
import { login, register } from "../../services/auth.service";

export default function LoginPopUp() {
    const [modoRegistro, setModoRegistro] = useState(false);
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState(null);

    const hacerLogin = async () => {
        try {
            await login(email, pass);
        } catch (e) {
            setError(e.message);
            alert("Error al iniciar sesión: " + e.message);
        }
    };

    const hacerRegistro = async () => {
        try {
            await register(nombre, email, pass);
        } catch (e) {
            setError(e.message);
            alert("Error al registrar usuario: " + e.message);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        modoRegistro ? hacerRegistro() : hacerLogin();
    };


    return (
        <div className="modal-fondo">
            <div className="modal-caja">
                <h2>{modoRegistro ? "Registrarse" : "Iniciar Sesión"}</h2>

                <form onSubmit={handleSubmit}>
                    {modoRegistro && (
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required minLength={1} maxLength={8}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        required minLength={6} maxLength={12}
                    />

                    {error && <p className="error">{error}</p>}

                    <button type="submit" className="btn-login">
                        {modoRegistro ? "Crear cuenta" : "Entrar"}
                    </button>
                </form>

                <p className="link" onClick={() => setModoRegistro(!modoRegistro)}>
                    {modoRegistro
                        ? "¿Ya tenés cuenta? Iniciar sesión"
                        : "¿No tenés cuenta? Registrate acá"}
                </p>
            </div>
        </div>
    );
}