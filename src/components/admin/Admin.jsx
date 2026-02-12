import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


export function Admin({ datos }) {
    const { user } = useAuth();
    if (!user || datos?.rol !== "admin") {
        alert("No tienes permiso para ver esta página.");
        return <Navigate to="/" replace />;
    }

    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const usuariosRef = collection(db, "users");

        getDocs(usuariosRef)
            .then((snapshot) => {
                const usuariosData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsuarios(usuariosData);
            })
            .catch((error) => {
                console.error("Error al cargar usuarios:", error);
            })
            .finally(() => setCargando(false));
    }, []);

    if (cargando) return <div>Cargando...</div>;

    const eliminarUsuario = async (id) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;
        try {
            const userRef = doc(db, "users", id);
            await updateDoc(userRef, { activo: false });
            setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: false } : u));
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    }

    return (
        
        <div className="lista-usuarios">
            {usuarios
            .filter(u => u.rol === "usuario")
            .filter(u => u.activo !== false)
            .map((u) => (
                <div key={u.id} className="usuario-card">
                    <Link to={`/admin/${u.id}`} className="usuario-item" >
                        <img src={u.imagen} alt="usuario" style= {{width:"100px", height:"100px"}} />
                    </Link>
                    <h3>{u.nombre}</h3>
                    <button className="eliminar-usuario" onClick={() => eliminarUsuario(u.id) }>⛔</button>

                </div>
            ))}
            
        </div>
    );
}