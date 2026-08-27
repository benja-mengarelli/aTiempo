//! ADMIN
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

// Antes leía TODA la colección "users" (todas las empresas mezcladas).
// Ahora lee solo los miembros de la empresa del admin que llama.
export async function getUsuarios(empresaId) {
    try {
        const miembrosRef = collection(db, "empresas", empresaId, "miembros");
        const snapshot = await getDocs(miembrosRef);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

    } catch (error) {
        console.error("Error FB en getUsuarios", error);
        throw error;
    }
}

// Ya no es un toggle de "activo": saca al usuario de ESA empresa puntual
// (borra su ficha de miembro + su índice propio en users/{uid}/empresas).
// Las reglas ya exigen que quien llama sea admin/superAdmin de esa empresa
// específica, así que un admin no puede tocar membresías de otra compañía.
export async function desactivarUsuario(userId, empresaId) {
    try {
        await deleteDoc(doc(db, "empresas", empresaId, "miembros", userId));
        await deleteDoc(doc(db, "users", userId, "empresas", empresaId));
    } catch (error) {
        console.error("Error al desactivar usuario", error);
        throw error;
    }
}
