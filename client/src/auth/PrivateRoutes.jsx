import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function PrivateRoutes() {
  const { auth } = useAuth();

  // ⏳ wait until auth state is known
  if (auth.loading) {
    return <div>Loading... wait for backend to spin up(free tier)-can take upto 50 seconds</div>; // or spinner
  }

  // ❌ not authenticated
  if (!auth.token) {
    return <Navigate to="/" replace />;
  }

  // ✅ authenticated → render nested routes
  return <Outlet />;
}
