import './App.css'

import { BrowserRouter, Routes, Route } from "react-router"
import Home from './components/Home';
import Login from './components/Login';

export default function App(){
return(
<>
<BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/home" element={<Home />} />
      </Routes>
 </BrowserRouter>
</>  
);

}

