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
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <VolunteerActivismIcon className="text-white" sx={{ fontSize: 24 }} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                Med<span className="text-blue-600">Click</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Healthcare Management
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg border border-slate-200 hover:border-red-200"
          >
            {isLoggingOut ? (
              <LoadingSpinner size="h-4 w-4" color="border-red-600" />
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