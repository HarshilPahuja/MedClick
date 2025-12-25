import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function PublicRoute() {
  const { auth } = useAuth();

  if (auth.loading) return <div>Loading...</div>;

  if (auth.token) return <Navigate to="/home" replace />;

  return <Outlet />;
}
