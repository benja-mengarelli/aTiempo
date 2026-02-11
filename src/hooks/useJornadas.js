import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function useJornadas(userId) {
    const [jornadas, setJornadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function refresh() {
        if (!userId) {
            setJornadas([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const q = query(collection(db, 'users', userId, 'jornadas'), orderBy('fecha', 'desc'));
            const snap = await getDocs(q);
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setJornadas(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!userId) {
            setJornadas([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, 'users', userId, 'jornadas'), orderBy('fecha', 'desc'));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                setJornadas(data);
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    return { jornadas, loading, error, refresh };
}
