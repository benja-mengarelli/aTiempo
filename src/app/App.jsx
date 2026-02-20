import LoginPopUp from '../components/auth/Login';
import { Navbar } from '../components/layout/Navbar';
import { Admin } from "../components/admin/Admin";
import  User  from "../components/user/User";
import { useAuth } from '../context/AuthContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MisHoras from '../components/user/MisHoras';
import VerHoras from '../components/admin/VerHoras';
import PantallaCarga from '../components/layout/PantallaCarga';

function App() {

  const {user, datos, cargando, logout} = useAuth();

  if (cargando) return <PantallaCarga />;
  if (!user) return <LoginPopUp />;

  return (
    <BrowserRouter>
      <Navbar user={{...datos, uid: user.uid}} onlogout={logout} />
      
      <Routes>

        <Route path='/' element= {datos?.rol === "admin"? <Admin datos= {{...datos}}/>  : <User/> } />
        <Route path='/admin/:id' element= {<VerHoras />} />
        <Route path='/user/:id' element= {<MisHoras/>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;