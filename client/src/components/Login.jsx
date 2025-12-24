import Spline from "@splinetool/react-spline";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");

  const [password_error, set_password_error] = useState(false);
  const [invalid_email_pass, set_invalid_email_pass] = useState(false);
  const [wrong_password, set_wrong_password] = useState(false);

  async function signup(e) {
    e.preventDefault();
    if (password.length === 0 || email.length === 0) {
      set_invalid_email_pass(true);
      setTimeout(() => {
        set_invalid_email_pass(false);
      }, 800);
    } else if (password.length < 8) {
      set_password_error(true);
      setTimeout(() => {
        set_password_error(false);
      }, 800);
    } else {
      try {
        const res = await axios.post(
          "http://localhost:3000/signin",
          {
            sending_email: email,
            sending_password: password,
          },
          { withCredentials: true }
        );
        if (res.data.success) {
          setAuth({ token: true, loading: false });
          navigate("/home");
        }
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    }
  }

  async function loginform() {
    if (email.length === 0 || password.length === 0) {
      set_invalid_email_pass(true);
      setTimeout(() => {
        set_invalid_email_pass(false);
      }, 800);
    } else {
      try {
        const res = await axios.post(
          "http://localhost:3000/login",
          {
            sending_email: email,
            sending_password: password,
          },
          {
            withCredentials: true, //for cookies and sessions across origins
          }
        );
        if (res.data === true) {
          setAuth({ token: true, loading: false });

          navigate("/home");
        }
      } catch (err) {
        if (err.response?.status === 401) { //not the idealest. assuming every 401=wrong password.
          set_wrong_password(true);
          set_password("");
          setTimeout(() => set_wrong_password(false), 800);
        } else {
          console.error(err);
        }
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-black text-white">
      {/* LEFT: Login */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">MedClick</h1>

        <p className="text-gray-400 mb-8 max-w-md">
          Smarter medicine tracking, simplified.
        </p>
        <form onSubmit={signup}>
          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl max-w-md">
            <input
              type="email"
              placeholder="Email"
              value={email}
              name="username"
              onChange={(e) => {
                set_email(e.target.value);
              }}
              className="w-full mb-4 px-4 py-3 rounded-md bg-black/40 border border-white/10 focus:outline-none focus:border-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={(e) => {
                set_password(e.target.value);
              }}
              className="w-full mb-6 px-4 py-3 rounded-md bg-black/40 border border-white/10 focus:outline-none focus:border-blue-500"
            />
            {password_error && (
              <h1 className="text-red-500 mb-5">Too short password!</h1>
            )}
            {invalid_email_pass && (
              <h1 className="text-red-500 mb-5">Invalid email or password</h1>
            )}

            {wrong_password && (
              <h1 className="text-red-500 mb-5">Wrong Password.</h1>
            )}
            {/* Buttons */}
            <div className="flex flex-col gap-4">
              {/* Primary */}

              <button
                type="button"
                onClick={loginform}
                className="w-full py-3 bg-blue-600 rounded-md hover:bg-blue-700 transition font-medium"
              >
                Login
              </button>

              {/* Secondary actions */}
              <h1>Don’t have an account yet?</h1>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition"
                >
                  Sign in
                </button>

                <button
                  type="submit"
                  className="w-1/2 py-3 bg-white text-black rounded-md hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <GoogleIcon />
                  <span className="text-sm font-medium">
                    Sign in with Google
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* RIGHT: Spline (hidden on mobile) */}
      <div className="hidden md:block md:w-1/2 h-screen ">
        <Spline scene="https://prod.spline.design/ZQy8AMOHaNAlP4x3/scene.splinecode" />
      </div>
    </div>
  );
}
