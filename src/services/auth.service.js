import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export const login = (email, pass) => {
    return signInWithEmailAndPassword(auth, email, pass);
}

export const register = async (nombre, email, pass, imagen) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, "users", cred.user.uid), {
        nombre: nombre,
        rol: "usuario",  // rol por defecto
        imagen: imagen,
        estado: "activo"
    });
    return cred;
};