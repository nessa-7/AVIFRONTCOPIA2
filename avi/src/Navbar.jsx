import { useAuth } from "./context/AuthContext";
import Nav from "./Nav"
import {Link, useNavigate} from 'react-router-dom'
import AdminLayout from "./AdminLayout";


function Navbar({children}){
    
    const {rol, id} = useAuth();

    console.log(rol)
    console.log(id)

        if(rol === "admin"){
            return (
            <AdminLayout>
                {children}
            </AdminLayout>
            )
        } 
        
        if (rol === "aspirante"){
            return <Nav></Nav>
        }

    const navigate = useNavigate()


    function Irlogin(){
        navigate('/login')
    }

    function Irregistro(){
        navigate('/registro')
    }

    function Irinicio(){
        navigate('/')
    }


    return(

        <div>

            <header className="landing-topbar">
                <div className="landing-brand">
                    <span className="brand-a" onClick={Irinicio}>AVI</span>
                    <span className="brand-b" onClick={Irinicio}> SENA </span>
                </div>

                <div className="landing-top-actions">
                    <button type="button" className="landing-course-btn" onClick={Irlogin}>
                    Login
                    </button>
                    <button type="button" className="landing-course-btn" onClick={Irregistro}>
                    Registro
                    </button>
                </div>
            </header>
           
        </div>
        

    )

}


export default Navbar