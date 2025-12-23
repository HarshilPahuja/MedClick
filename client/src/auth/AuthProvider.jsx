import { useState, createContext, useContext } from 'react';
const AuthContext = createContext(null);


export default function AuthProvider({ children }){

const [auth, setAuth] = useState({
    token: false,
  });

    return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// custom hook (clean usage)
export function useAuth() {
  return useContext(AuthContext);
}