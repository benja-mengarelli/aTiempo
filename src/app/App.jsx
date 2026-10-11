// componentes
import Landing from '../components/landing/Landing';
import LoginPopUp from '../components/auth/Login';
import Navbar from '../components/layout/Navbar';
import Admin from "../components/admin/Admin";
import User from "../components/user/User";
import PantallaEmpresas from '../components/layout/pantallaEmpresas';
import PantallaCarga from '../components/layout/PantallaCarga';
import Configuracion from "../components/admin/Configuracion";
import MisHoras from '../components/user/MisHoras';
import VerHoras from '../components/admin/VerHoras';
import Rosco from "../components/juegos/Rosco"
import EmpresaLayout from '../components/layout/EmpresaLayout';
import SuperUser from '../components/superUser/SuperUser';

// contexto para envolver app
// auth se envuelve en index.jsx
import { useAuth } from '../context/AuthContext';
import { JornadaActivaProvider } from '../context/jornadaContext';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function App() {

  const { user, cargando, rolActual } = useAuth();

  // verificar V nueva
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  useEffect(() => {
    if (needRefresh) {
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  //! dejar solo cargando -- cargandoConfiguracion pasa a pantalla user/admin
  if (cargando) return <PantallaCarga />;

  return (
    <JornadaActivaProvider>
      <BrowserRouter>

        {user && <Navbar/>}

        <Routes>
          <Route path="/" element={< Landing />} />
          <Route path="/login" element={<LoginPopUp />} />
          <Route path="/empresas" element={<PantallaEmpresas />} />
          <Route path="/superUser" element={ <SuperUser />} />
          
          <Route path="empresas/:empresaId" element= {<EmpresaLayout />} >
            <Route path="/empresas/:empresaId" element={rolActual === "admin" ? <Admin /> : <User />} />
            <Route path='/empresas/:empresaId/admin/verHoras/:id' element={<VerHoras />} />
            <Route path="/empresas/:empresaId/admin/configuracion" element={<Configuracion />} />
            <Route path='/empresas/:empresaId/user/misHoras/:id' element={<MisHoras />} />
          </Route>
          
          <Route path='/juego' element={<Rosco />} />
        </Routes>
      </BrowserRouter>
    </JornadaActivaProvider>
  );
}
