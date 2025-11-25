import './App.css'
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Main from './components/Main';
export default function App(){
return(
<>
    
    <Navbar/>
    <div className='h-[calc(100vh-14vh)] bg-[#f9fbfc]'>
    <Hero/>
    <Main/>
    </div>
</>  
);

}

