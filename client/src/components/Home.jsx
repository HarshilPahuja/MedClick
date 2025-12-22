 
import Navbar from './Navbar';
import Hero from './Hero';
import Main from './Main';
 export default function Home(){
 return(
    
 <div className='home'>
        <Navbar/>
        <div className='h-[calc(100vh-14vh)] bg-[#f9fbfc]'>
        <Hero/>
        <Main/>
        </div>
    </div>
 );
}