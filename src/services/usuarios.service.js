//! ADMIN
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function getUsuarios() {
    try{
        const usuariosRef = collection(db, "users");
        const snapshot = await getDocs(usuariosRef);
    
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

    }catch (error){
        console.error("Error FB en getUsuarios", error);
        throw error;
    }
}

export async function desactivarUsuario(id) {
    try{
        const userRef = doc(db, "users", id);
        return updateDoc(userRef, { activo: false });
    } catch (error){
        console.error("Error al desactivar usuario", error);
        throw error;
    }
}