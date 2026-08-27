// Jornadas Firestore service
import { db } from '../services/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { query, orderBy, onSnapshot, getDocs, where } from 'firebase/firestore';

// Get jornadas (with snapshot listener) agrega escucha a cambios en tiempo real
export function subscribeJornadas(empresaId, userId, onData, onError) {
  if (!userId || !empresaId) return () => {};

  const q = query(
    collection(db, 'empresas', empresaId, 'jornadas'),
    where('uid', '==', userId),
    orderBy('fecha', 'desc')    
  );
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(data);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
  return unsubscribe;
}

export async function getJornadas(empresaId, userId) {
  //Cambio de query para que lea solo las no expiradas
  const hoy = new Date();
  const q = query(
    collection(db, 'empresas', empresaId, 'jornadas'),
    where('uid', '==', userId),
    where('expiracion', '>', hoy),
    orderBy('fecha', 'desc')
  );
  
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function agregarJornada(empresaId, userId, jornada) {
  const ref = collection(db, 'empresas', empresaId, 'jornadas');
  return addDoc(ref, jornada);
}

export async function eliminarJornada(empresaId, jornadaId) {
  const ref = doc(db, 'empresas', empresaId, 'jornadas', jornadaId);
  return deleteDoc(ref);
}

