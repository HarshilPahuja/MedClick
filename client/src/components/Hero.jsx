import { useAuth } from "../auth/AuthProvider";

export default function Hero() {
  const { auth } = useAuth();
  const userName = auth.user?.email?.split('@')[0] || "User";

  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Welcome back, <span className="text-blue-600 capitalize">{userName}</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
          Your health is our priority. Here's a look at your medication schedule and daily wellness tasks for today.
        </p>
      </div>
    </div>
  );
}
