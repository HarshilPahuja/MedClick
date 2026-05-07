import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import LogoutIcon from '@mui/icons-material/Logout';

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
      logout();
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/30">
              <VolunteerActivismIcon className="text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white tracking-tight">
                MEDI<span className="text-blue-500">CLICK</span>
              </h1>
              <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                Medication Companion
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group relative flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300 font-medium overflow-hidden"
          >
            {isLoggingOut ? (
              <LoadingSpinner size="h-4 w-4" color="border-red-400" />
            ) : (
              <>
                <LogoutIcon fontSize="small" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}