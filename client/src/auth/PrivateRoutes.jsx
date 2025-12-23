import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from "./AuthProvider";

export default function PrivateRoutes(){

    const { auth } = useAuth();
    return (
    auth.token ? <Outlet/> : <Navigate to='/'/>
  )
}