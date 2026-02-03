import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import LoginPopUp from "../modulos/Login";
import { Navbar } from '../components/layout/Navbar';
import { Admin} from "../components/admin/Admin";
import { User} from "../components/user/User";
import {Footer } from "../components/layout/Footer";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Obtener datos adicionales del usuario desde Firestore
        try {
          const docRef = doc(db, "users", u.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setDatos(docSnap.data());

          } else {
            console.log("No such document!");
            setDatos(null);
          }
        }
        catch (err) {
          console.error("Error obteniendo datos:", err);
          setDatos(null);
        }
      }
      else {
        setDatos(null);
      }

      setUsuario(u);
      setCargando(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };
  /* if (cargando) return <div>Cargando...</div>; //! Agregar pantalla carga */

  // Si no hay usuario, mostrar login
  if (!usuario) return <LoginPopUp />;

  // Si hay usuario, mostrar contenido de la app 
  return (
    <>
      <Navbar user={datos} onlogout={logout} />

      {datos?.rol === "admin" && 
      (
        <>
          <h1>Panel Administrador</h1>
          <Admin />
        </>
      )}

      {datos?.rol === "usuario" && 
      (
        <>
          <h1>Panel Usuario</h1>
          <User />
        </>
      )}

      <Footer/>
    </>
  )
}

export default App
