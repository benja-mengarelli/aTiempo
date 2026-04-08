import { useEffect, useState } from 'react';
import { subscribeJornadas, getJornadas } from '../services/jornadas.service';

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
            const data = await getJornadas(userId);
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
        const unsubscribe = subscribeJornadas(
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
