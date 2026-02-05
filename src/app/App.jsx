import LoginPopUp from '../components/auth/Login';
import { Navbar } from '../components/layout/Navbar';
import { Admin } from "../components/admin/Admin";
import  User  from "../components/user/User";
import { Footer } from "../components/layout/Footer";
import { useAuth } from '../context/AuthContext';

function App() {

  const {user, datos, cargando, logout} = useAuth();

  if (cargando) return <div>Cargando...</div>;
  if (!user) return <LoginPopUp />;

  return (
    <>
      <Navbar user={datos} onlogout={logout} />

      {datos?.rol === "admin" && <Admin />}
      {datos?.rol === "usuario" && <User />}

      <Footer/>
    </>
  );
}

export default App;