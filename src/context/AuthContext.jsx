import { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [datos, setDatos] = useState(null);
    // Cada item: { id, rol, nombre, activo, ... } -- viene de users/{uid}/empresas
    const [empresas, setEmpresas] = useState([]);
    const [empresaActivaId, setEmpresaActivaId] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    setUser(user);
                    setCargando(true);

                    //Lecturas en paralelo para establecer el user y su/s empresa/s
                    const [docSnap, empresasSnap] = await Promise.all([
                        getDoc(doc(db, "users", user.uid)),
                        getDocs(collection(db, "users", user.uid, "empresas")),
                    ]);

                    // Datos del usuario (nombre, uid, etc)
                    setDatos(docSnap.exists() ? docSnap.data() : null);

                    // A qué empresas pertenece
                    const listaEmpresas = empresasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
                    setEmpresas(listaEmpresas);

                    // Resolvemos la empresa activa EN LA MISMA PASADA (no en un
                    // efecto separado), para que cargando no baje a false hasta
                    // que rolActual/empresaActivaId también estén listos.
                    
                   /*  if (listaEmpresas.length === 0) {
                        setEmpresaActivaId(null);
                    } else if (listaEmpresas.length === 1) {
                        setEmpresaActivaId(listaEmpresas[0].id);
                    } else {
                        const guardada = localStorage.getItem(`empresaActiva:${user.uid}`);
                        const sigueSiendoValida = listaEmpresas.some((e) => e.id === guardada);
                        setEmpresaActivaId(sigueSiendoValida ? guardada : null);
                    } */
                } else {
                    setUser(null);
                    setDatos(null);
                    setEmpresas([]);
                    setEmpresaActivaId(null);
                }
            } catch (e) {
                console.error("Error al cargar usuario:", e);
                setUser(null);
                setDatos(null);
                setEmpresas([]);
                setEmpresaActivaId(null);
            } finally {
                setCargando(false);
            }
        });

        return () => unsub();
    }, []);

    // Solo marca "dónde está parado el usuario". Sin persistencia: si recarga la
    // página, la ruta (/empresa/:empresaId/...) es la que lo vuelve a setear.
    const cambiarEmpresaActiva = (empresaId) => {
        if (!empresas.some((e) => e.id === empresaId)) return; // solo empresas a las que pertenece
        setEmpresaActivaId(empresaId);
    };

    const salirDeEmpresa = () => setEmpresaActivaId(null);

    // `empresas` se carga una sola vez al loguearse: después de canjear un
    // código hay que volver a pedirla, si no la empresa nueva no aparece.
    const refrescarEmpresas = async () => {
        if (!user) return [];
        const snap = await getDocs(collection(db, "users", user.uid, "empresas"));
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEmpresas(lista);
        return lista;
    };

    const empresaActiva = empresas.find((e) => e.id === empresaActivaId) || null;
    const rolActual = empresaActiva?.rol || null;

    const logout = async () => {
        // Reseteamos el estado ANTES de invalidar la sesión
        setUser(null);
        setDatos(null);
        setEmpresas([]);
        setEmpresaActivaId(null);
        await signOut(auth);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                datos,
                empresas,
                empresaActivaId,
                empresaActiva,
                rolActual,
                cambiarEmpresaActiva,
                cargando,
                logout,
                salirDeEmpresa,
                refrescarEmpresas,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
