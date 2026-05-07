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
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition duration-500" />
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-400 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition duration-500">
                <VolunteerActivismIcon className="text-white" sx={{ fontSize: 28 }} />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white tracking-tighter leading-none">
                MEDI<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">CLICK</span>
              </h1>
              <span className="text-[9px] text-blue-400/60 uppercase tracking-[0.3em] font-black mt-1">
                Your Health First
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group relative flex items-center gap-2 px-6 py-2.5 bg-white/[0.03] hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all duration-500 font-bold overflow-hidden"
          >
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:animate-[shimmer_2s_infinite] -z-10" />
            {isLoggingOut ? (
              <LoadingSpinner size="h-4 w-4" color="border-red-400" />
            ) : (
              <>
                <LogoutIcon sx={{ fontSize: 18 }} />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}