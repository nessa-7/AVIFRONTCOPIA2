import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {AuthPro, useAuth } from "./context/AuthContext";


import './App.css'
import Registro from "./Registro";
import Resultado from "./Resultado";
import Programas from "./Programas";
import Mapa from "./Mapa";
import Login from "./Login";
import Inicio from "./Inicio";
import Estadisticas from "./Estadisticas";
import RegistroAdmins from "./RegistroAdmins";
import AspirantesGet from "./AspirantesGet";
import LoginAdmin from "./LoginAdmin";
import Seleccion from "./Seleccion";
import Navbar from "./Navbar";
import AdminGet from "./AdminGet";
import EditarPerfil from "./EditarPerfil";
import TestRIASEC from "./TestRIASEC";
import Pretest from "./PreTest";
import EditarAdmin from "./EditarAdmin";
import ProgramasAdmin from "./ProgramasAdmin";
import MisReportes from "./MisReportes";
import ReportesAspirante from "./ReportesAspirante";
import InicioAspirante from "./InicioAspirante";
import ComoFuncionaTest from "./ComoFuncionaTest";
import AprendizGet from "./AprendizGet";
import RIASECInfo from "./RIASECInfo";
import InicioAdmin from "./InicioAdmin";
import Calificaciones from "./Calificaciones";
import DashboardAnalitica from "./DashboardAnalitica";


function App() {

  return (
      <div >
      <AuthPro>
        <BrowserRouter>
          
            <Navbar></Navbar>
            <Routes>
              <Route path="/" element={<Inicio></Inicio>}></Route>
              <Route path="/registro" element={<Registro></Registro>}></Route>
              <Route path="/resultado" element={<Resultado></Resultado>}></Route>
              <Route path="/programas" element={<Programas></Programas>}></Route>
              <Route path="/mapa" element={<Mapa></Mapa>}></Route>
              <Route path="/login" element={<Login></Login>}></Route>
              <Route path="/estadisticas" element={<Estadisticas></Estadisticas>}></Route>
              <Route path="/registroadmin" element={<RegistroAdmins></RegistroAdmins>}></Route>
              <Route path="/listaraspirantes" element={<AspirantesGet></AspirantesGet>}></Route>
              <Route path="/loginadmin" element={<LoginAdmin></LoginAdmin>}></Route>
              <Route path="/seleccion" element={<Seleccion></Seleccion>}></Route>
              <Route path="/listaradmins" element={<AdminGet></AdminGet>}></Route>
              <Route path="/editar-perfil" element={<EditarPerfil></EditarPerfil>}></Route>
              <Route path="/preguntastest" element={<TestRIASEC></TestRIASEC>}></Route>
              <Route path="/pretest" element={<Pretest></Pretest>}></Route>
              <Route path="/editar/:id" element={<EditarAdmin></EditarAdmin>}></Route>
              <Route path="/listarprogramas" element={<ProgramasAdmin></ProgramasAdmin>}></Route>
              <Route path="/misreportes" element={<MisReportes></MisReportes>}></Route>
              <Route path="/reportesporasp/:id" element={<ReportesAspirante></ReportesAspirante>}></Route>
              <Route path="/inicioaspirante" element={<InicioAspirante></InicioAspirante>}></Route>
              <Route path="/inicioadmin" element={<InicioAdmin></InicioAdmin>}></Route>
              <Route path="/comofuncionatest" element={<ComoFuncionaTest></ComoFuncionaTest>}></Route>
              <Route path="/riasecinfo" element={<RIASECInfo></RIASECInfo>}></Route>
              <Route path="/calificacion" element={<Calificaciones></Calificaciones>}></Route>

              <Route path="/admin/aprendices" element={<AprendizGet></AprendizGet>}></Route>
              <Route path="/listaraprendices" element={<AprendizGet />} />
              <Route path="/dashboard-demanda" element={<DashboardAnalitica />} />
            </Routes>
          
        </BrowserRouter>
      </AuthPro>
      </div>
  )
}

export default App


//componente interno

function RequireAuth({children}) {
  const {token} = useAuth();
  
  if(!token){
    return <Navigate to="/login"></Navigate>
  }
  else{
  return children;
  }
}
