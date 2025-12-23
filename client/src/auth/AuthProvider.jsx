import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: false,
    loading: true,   // 👈 IMPORTANT
  });

  useEffect(() => {
    axios
      .get("http://localhost:3000/me", { withCredentials: true })
      .then((res) => {
        if (res.data.authenticated) {
          setAuth({ token: true, loading: false });
        } else {
          setAuth({ token: false, loading: false });
        }
      })
      .catch(() => {
        setAuth({ token: false, loading: false });
      });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
