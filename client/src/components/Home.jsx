 
import Navbar from './Navbar';
import Hero from './Hero';
import Main from './Main';
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Hero />
      <Main />
    </div>
  );
}