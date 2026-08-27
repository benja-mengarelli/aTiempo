import { useEffect, useState } from 'react';
import { subscribeJornadas, getJornadas } from '../services/jornadas.service';

export default function useJornadas(empresaId,userId) {
    const [jornadas, setJornadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function refresh() {
        if (!userId || !empresaId) {
            setJornadas([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await getJornadas(empresaId, userId);
            setJornadas(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!userId || !empresaId) {
            setJornadas([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeJornadas(
            empresaId,
            userId,
            (data) => {
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
