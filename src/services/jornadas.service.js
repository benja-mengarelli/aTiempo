// Jornadas Firestore service
import { db } from '../services/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';

// Get jornadas (with snapshot listener)
export function subscribeJornadas(userId, onData, onError) {
  if (!userId) return () => {};
  const q = query(collection(db, 'users', userId, 'jornadas'), orderBy('fecha', 'desc'));
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

// Get jornadas (one-time fetch)
export async function getJornadas(userId) {
  const q = query(collection(db, 'users', userId, 'jornadas'), orderBy('fecha', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function agregarJornada(userId, jornada) {
  const ref = collection(db, 'users', userId, 'jornadas');
  return addDoc(ref, jornada);
}

export async function eliminarJornada(userId, jornadaId) {
  const ref = doc(db, 'users', userId, 'jornadas', jornadaId);
  return deleteDoc(ref);
}
