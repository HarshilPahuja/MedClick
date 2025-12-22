import { Navigate, Outlet } from 'react-router-dom'
export default function PrivateRoutes(){

    let auth={token:true}; //do auth here
    return (
    auth.token ? <Outlet/> : <Navigate to='/'/>
  )
}