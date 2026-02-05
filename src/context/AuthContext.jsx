import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDatos(docSnap.data());
                } else {
                    console.log("No such document!");
                    setDatos(null);
                }
            } catch (e) {
                console.error("Error al cargar usuario:", e);
                setDatos(null);
            }

            setCargando(false);
        });

        return () => unsub();
    }, []);

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, datos, cargando, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);