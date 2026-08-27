import LoginPopUp from '../components/auth/Login';
import { Navbar } from '../components/layout/Navbar';
import { Admin } from "../components/admin/Admin";
import  User  from "../components/user/User";
import { SuperUser } from '../components/superUser/SuperUser';
import { useAuth } from '../context/AuthContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MisHoras from '../components/user/MisHoras';
import VerHoras from '../components/admin/VerHoras';
import Rosco from "../components/juegos/Rosco"
import PantallaCarga from '../components/layout/PantallaCarga';
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function App() {

  const {user, datos, cargando, logout} = useAuth();

  // verificar v nueva
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  
  useEffect( () => {
    const jornadaActiva = localStorage.getItem("inicioTs");

    if (needRefresh && !jornadaActiva) {
      
        updateServiceWorker(true);
      
    }
  }, [needRefresh, updateServiceWorker]);

  
  if (cargando) return <PantallaCarga />;
  if (!user) return <LoginPopUp />;

  return (
    <BrowserRouter>
      <Navbar user={{...datos, uid: user.uid}} onlogout={logout} />
      
      <Routes>

        <Route path='/' element= {datos?.rol === "admin"? <Admin datos= {{...datos}}/>  : datos?.rol === "superAdmin" ? <SuperUser datos= {{...datos}}/> : <User/> } />
        <Route path='/admin/:id' element= {<VerHoras />} />
        <Route path='/user/:id' element= {<MisHoras/>} />
        <Route path='/juego' element= {<Rosco/>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;