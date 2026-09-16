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
    const [configuracionEmpresa, setConfiguracionEmpresa] = useState(null);
    const [cargandoConfiguracion, setCargandoConfiguracion] = useState(false);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    setUser(user);
                    setCargando(true);

                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    setDatos(docSnap.exists() ? docSnap.data() : null);

                    // A qué empresas pertenece
                    const empresasSnap = await getDocs(collection(db, "users", user.uid, "empresas"));
                    const listaEmpresas = empresasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
                    setEmpresas(listaEmpresas);

                    // Resolvemos la empresa activa EN LA MISMA PASADA (no en un
                    // efecto separado), para que cargando no baje a false hasta
                    // que rolActual/empresaActivaId también estén listos.
                    if (listaEmpresas.length === 0) {
                        setEmpresaActivaId(null);
                    } else if (listaEmpresas.length === 1) {
                        setEmpresaActivaId(listaEmpresas[0].id);
                    } else {
                        const guardada = localStorage.getItem(`empresaActiva:${user.uid}`);
                        const sigueSiendoValida = listaEmpresas.some((e) => e.id === guardada);
                        setEmpresaActivaId(sigueSiendoValida ? guardada : null);
                    }
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

    // Config de la empresa (coordenadas, redondeo, etc): efecto SEPARADO del
    // principal, con su propio loading, para no bloquear el resto de la app
    // esperando algo que la mayoría de las pantallas ni necesita.
    useEffect(() => {
        if (!empresaActivaId) {
            setConfiguracionEmpresa(null);
            return;
        }

        let cancelado = false;
        setCargandoConfiguracion(true);

        getDoc(doc(db, "empresas", empresaActivaId))
            .then((snap) => {
                if (cancelado) return;
                setConfiguracionEmpresa(snap.exists() ? snap.data() : null);
            })
            .catch((e) => {
                console.error("Error al cargar configuración de la empresa:", e);
                if (!cancelado) setConfiguracionEmpresa(null);
            })
            .finally(() => {
                if (!cancelado) setCargandoConfiguracion(false);
            });

        return () => { cancelado = true; };
    }, [empresaActivaId]);

    // Solo debería llamarla un admin - las reglas ya lo exigen del lado del
    // servidor (allow update en empresas/{id}), esto es solo el atajo del cliente.
    const actualizarConfiguracionEmpresa = async (cambios) => {
        if (!empresaActivaId) throw new Error("No hay empresa activa.");
        await updateDoc(doc(db, "empresas", empresaActivaId), cambios);
        setConfiguracionEmpresa((prev) => ({ ...prev, ...cambios }));
    };

    const cambiarEmpresaActiva = (empresaId) => {
        if (user) localStorage.setItem(`empresaActiva:${user.uid}`, empresaId);
        setEmpresaActivaId(empresaId);
    };

    const empresaActiva = empresas.find((e) => e.id === empresaActivaId) || null;
    const rolActual = empresaActiva?.rol || null;

    const logout = async () => {
        // Reseteamos el estado ANTES de invalidar la sesión, para que los
        // componentes que dependen de empresaActivaId empiecen a desmontarse
        // lo antes posible (acorta, no elimina del todo, la ventana donde un
        // fetch en curso puede llegar a chocar con la sesión ya invalidada).
        setUser(null);
        setDatos(null);
        setEmpresas([]);
        setEmpresaActivaId(null);
        setConfiguracionEmpresa(null);
        await signOut(auth);
    };

    // Ejemplo de uso en el router/pantalla principal:
    //   cargando                              -> loading/skeleton
    //   !cargando && empresas.length === 0     -> pantalla "ingresar código"
    //   !cargando && empresaActivaId === null  -> pantalla "elegí tu empresa" (solo pasa con 2+)
    //   !cargando && empresaActivaId !== null  -> app normal, Navbar según rolActual

    return (
        <AuthContext.Provider
            value={{
                user,
                datos,
                empresas,
                empresaActivaId,
                empresaActiva,
                configuracionEmpresa,
                cargandoConfiguracion,
                actualizarConfiguracionEmpresa,
                rolActual,
                cambiarEmpresaActiva,
                cargando,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
