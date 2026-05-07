import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post("https://medclick-5sc0.onrender.com/logout", {}, { withCredentials: true });
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if server call fails, we should probably clear local state
      logout();
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <nav className='flex items-center justify-between px-10 border-b border-gray-300 bg-[#fbfdff] h-[14vh]'>
        <div className='flex items-center gap-5'>
          <VolunteerActivismIcon />
          <div className='flex flex-col'>
            <h1 className="text-3xl font-normal text-gray-700" style={{ fontFamily: 'Oswald, sans-serif' }}>MediClick</h1>
            <h3>Your Medication Companion</h3>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition flex items-center gap-2"
        >
          {isLoggingOut ? <LoadingSpinner size="h-4 w-4" color="border-white" /> : "Logout"}
        </button>
      </nav>
    </>
  );
}

//issue1: inline google font works, but using tailwind it doesnt work.