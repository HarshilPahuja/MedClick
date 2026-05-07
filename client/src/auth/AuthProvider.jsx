import { useState, useEffect, createContext, useContext } from "react";
import { getFCMToken, listenForMessages } from "../fcm";

import axios from "axios";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: false,
    loading: true, // 👈 IMPORTANT
  });

  useEffect(() => {
    axios
      .get("https://medclick-5sc0.onrender.com/me", { withCredentials: true })
      .then((res) => {
        if (res.data.authenticated) {
          setAuth({ token: true, user: res.data.user, loading: false });
        } else {
          setAuth({ token: false, loading: false });
        }
      })
      .catch(() => {
        setAuth({ token: false, loading: false });
      });
  }, []);

useEffect(() => {
  if (!auth.token) return;

  const setupFCM = async () => {
    let token = await getFCMToken();
    if (!token) {
      console.log("No FCM token generated (possibly blocked by browser)");
      listenForMessages();
      return;
    }

    await axios.post(
      "https://medclick-5sc0.onrender.com/store-fcm-token",
      { token },
      { withCredentials: true }
    );

    listenForMessages();
  };

  setupFCM();
}, [auth.token]);


  const logout = () => {
    setAuth({ token: false, loading: false });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}
