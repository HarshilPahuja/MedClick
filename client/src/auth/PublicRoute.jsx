import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function PublicRoute() {
  const { auth } = useAuth();

  if (auth.loading) return <div>Loading... wait for backend to spin up(free tier)-can take upto 50 seconds</div>;

  if (auth.token) return <Navigate to="/home" replace />;

  return <Outlet />;
}
