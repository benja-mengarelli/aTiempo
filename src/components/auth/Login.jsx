import { useState } from "react";
import { auth, db } from "../DB/firebase";
import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

export default function LoginPopUp() {
    const [modoRegistro, setModoRegistro] = useState(false);
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");

    const hacerLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (e) {
            setError(e.message);
            alert("Error al iniciar sesión: " + e.message);
        }
    };

    const hacerRegistro = async () => {
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, pass);

            await setDoc(doc(db, "users", cred.user.uid), {
                nombre: nombre,
                rol: email === "benjamengarelli@gmail.com"? "admin" : 
                "usuario" // rol por defecto
            });
            console.log("Usuario registrado con UID:", cred.user.uid);

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
                        required min={6} max={12}
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