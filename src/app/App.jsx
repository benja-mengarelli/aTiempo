import LoginPopUp from '../components/auth/Login';
import { Navbar } from '../components/layout/Navbar';
import { Admin } from "../components/admin/Admin";
import {PantallaEmpresas} from '../components/layout/pantallaEmpresas';
import PantallaCarga from '../components/layout/PantallaCarga';
import  User  from "../components/user/User";
import Configuracion from "../components/admin/Configuracion";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MisHoras from '../components/user/MisHoras';
import VerHoras from '../components/admin/VerHoras';
import Rosco from "../components/juegos/Rosco"
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { JornadaActivaProvider } from '../context/jornadaContext';
export default function App() {

  const {user, datos, rolActual, cargando, logout} = useAuth();

  // verificar V nueva
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  
  useEffect( () => {
    if (needRefresh) {
        updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  if (cargando) return <PantallaCarga />;
  if (!user) return <LoginPopUp />;

  return (
    <JornadaActivaProvider>  
      <BrowserRouter>
        {user && <Navbar user={{...datos, uid: user.uid}} onlogout={logout} />}
        
        <Routes>
          <Route path="/empresas" element= {<PantallaEmpresas />} />
          <Route path="/" element= {rolActual === 'admin' ? <Admin /> : <User />} />
          <Route path="/admin/configuracion" element= {<Configuracion />} />
          <Route path='/admin/:id' element= {<VerHoras />} />
          <Route path='/user/:id' element= {<MisHoras/>} />
          <Route path='/juego' element= {<Rosco/>} />
        </Routes>
      </BrowserRouter>
    </JornadaActivaProvider>
  );
}
