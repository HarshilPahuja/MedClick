import './App.css'
import { BrowserRouter, Routes, Route } from "react-router"
import Home from './components/Home';
import Login from './components/Login';
import PrivateRoutes from './auth/PrivateRoutes';
import PublicRoute from "./auth/PublicRoute";


export default function App(){
return(
<>
<BrowserRouter>
      <Routes>
        <Route element={<PublicRoute/>}>
            <Route path="/" element={<Login />} />
        </Route>
         <Route element={<PrivateRoutes/>}>
            <Route path='/home' element={<Home/>} />
          </Route>
      </Routes>
 </BrowserRouter>
</>  
);

}

