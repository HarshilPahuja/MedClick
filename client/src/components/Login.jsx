import Spline from "@splinetool/react-spline";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";


export default function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const [password_error, set_password_error] = useState(false);
  const [invalid_email_pass, set_invalid_email_pass] = useState(false);
  const [wrong_password, set_wrong_password] = useState(false);
  const [email_exists, set_email_exists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error_msg, set_error_msg] = useState("");


  async function signup(e) {
    e.preventDefault();
    if (password.length === 0 || email.length === 0 || (isSignup && fullName.length === 0)) {
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
      setIsLoading(true);
      try {
        const res = await axios.post(
          "https://medclick-5sc0.onrender.com/signin",
          {
            sending_email: email,
            sending_password: password,
            sending_name: fullName
          },
          { withCredentials: true }
        );
        if (res.data.success) {
          setAuth({ token: true, loading: false });
          navigate("/home");
        }
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.error?.includes("duplicate")) {
          set_email_exists(true);
          setTimeout(() => set_email_exists(false), 2000);
        } else {
          set_error_msg("Sign in failed. Please try again.");
          setTimeout(() => set_error_msg(""), 2000);
        }
        console.error(err.response?.data || err.message);
      } finally {
        setIsLoading(false);
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
      setIsLoading(true);
      try {
        const res = await axios.post(
          "https://medclick-5sc0.onrender.com/login",
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
          setTimeout(() => set_wrong_password(false), 2000);
        } else {
          set_error_msg("Login failed. Please try again.");
          setTimeout(() => set_error_msg(""), 2000);
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

  }

  return (
    <div className="min-h-screen w-full flex bg-black text-white">
      {/* LEFT: Login */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tighter">MedClick</h1>

        <p className="text-gray-400 mb-8 max-w-md">
          Smarter medicine tracking, simplified for your health.
        </p>
        <form onSubmit={isSignup ? signup : loginform}>
          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl max-w-md border border-white/5 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-blue-500">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h2>

            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mb-4 px-4 py-3 rounded-md bg-black/40 border border-white/10 focus:outline-none focus:border-blue-500 transition-all"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              name="username"
              onChange={(e) => {
                set_email(e.target.value);
              }}
              className="w-full mb-4 px-4 py-3 rounded-md bg-black/40 border border-white/10 focus:outline-none focus:border-blue-500 transition-all"
              required
            />

            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={(e) => {
                set_password(e.target.value);
              }}
              className="w-full mb-6 px-4 py-3 rounded-md bg-black/40 border border-white/10 focus:outline-none focus:border-blue-500 transition-all"
              required
            />
            {password_error && (
              <h1 className="text-red-500 mb-5">Too short password!</h1>
            )}
            {invalid_email_pass && (
              <h1 className="text-red-500 mb-5">Invalid email or password</h1>
            )}

            {wrong_password && (
              <h1 className="text-red-500 mb-5">Incorrect Email or Password.</h1>
            )}
            {email_exists && (
              <h1 className="text-red-500 mb-5">Email already exists.</h1>
            )}
            {error_msg && (
              <h1 className="text-red-500 mb-5">{error_msg}</h1>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
              >
                {isLoading ? (
                  <LoadingSpinner size="h-5 w-5" color="border-white" />
                ) : isSignup ? (
                  "Create Account"
                ) : (
                  "Login"
                )}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-gray-500 text-sm">OR</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <button
                type="button"
                className="w-full py-4 bg-white text-black rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 font-bold active:scale-95 shadow-lg"
                onClick={() => {
                  window.location.href =
                    "https://medclick-5sc0.onrender.com/auth/google";
                }}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <p className="text-center text-gray-400 mt-4">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-blue-500 font-bold hover:underline"
                >
                  {isSignup ? "Login here" : "Sign up here"}
                </button>
              </p>
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
