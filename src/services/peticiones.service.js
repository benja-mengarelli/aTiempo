import { db } from '../services/firebase';
import {
    collection,
    doc,
    setDoc,
    addDoc,
    getDocs,
    query,
    where,
    writeBatch,
} from 'firebase/firestore';

/**
 * Crea una petición. Como ahora se borra al resolverse (aprobada o
 * rechazada), "existir en la colección" ya significa "pendiente" - no
 * hace falta un campo estado.
 *
 * tipo: "agregar" | "editar" | "eliminar"
 * datos esperados según tipo:
 *   agregar  -> { fecha, payload, mensaje }
 *   editar   -> { fecha, jornadaId, payload, mensaje }
 *   eliminar -> { fecha, jornadaId, mensaje }
 */
export async function crearPeticion(empresaId, userId, nombre, tipo, datos) {
    
    const peticionId = datos.jornadaId ?? `sin-jornada-${userId}`;
    
    const ref = doc(
        db,
        "empresas",
        empresaId,
        "peticiones",
        peticionId
    );

    return setDoc(ref, {
        tipo,
        uid: userId,
        nombre,
        jornadaId: datos.jornadaId ?? null,
        payload: datos.payload ?? null,
        fecha: datos.fecha,
        mensaje: datos.mensaje || "",
    });
}

export async function bulk_eliminarPeticiones(empresaId, peticionesId) {
    const batch = writeBatch(db);
    try {
        for (const peticionId of peticionesId) {
            const peticionRef = doc(db, 'empresas', empresaId, 'peticiones', peticionId);
            batch.delete(peticionRef);
        }
        await batch.commit();
    } catch (error) {
        console.error("Error al eliminar peticiones:", error);
        throw error;
    }
}

export async function bulk_aprobarPeticiones(empresaId, peticiones) {
    const batch = writeBatch(db);

    try {
        for (const peticion of peticiones) {
            switch (peticion.tipo) {
                case 'agregar': {
                    const newJornadaRef = doc(collection(db, 'empresas', empresaId, 'jornadas'));
                    batch.set(newJornadaRef, {
                        ...peticion.payload,
                    });
                    break;
                }
                case 'editar': {
                    const jornadaRef = doc(db, 'empresas', empresaId, 'jornadas', peticion.jornadaId);
                    batch.update(jornadaRef, { ...peticion.payload });
                    break;
                }
                case 'eliminar': {
                    const jornadaToDeleteRef = doc(db, 'empresas', empresaId, 'jornadas', peticion.jornadaId);
                    batch.delete(jornadaToDeleteRef);
                    break;
                }
                default:
                    throw new Error(`Tipo de petición desconocido: ${peticion.tipo}`);
            }
            const peticionRef = doc(db, 'empresas', empresaId, 'peticiones', peticion.id);
            batch.delete(peticionRef);
        }
        await batch.commit();
    } catch (error) {
        console.error("Error al aprobar peticiones:", error);
        throw error;
    }
}