import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function Hero() {
  const { auth } = useAuth();
  const userName = auth.user?.email?.split('@')[0] || "User";

  return (
    <div className="pt-10 pb-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
          
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 relative z-10">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 capitalize">{userName}</span>!
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto relative z-10">
            Keep track of your health journey. You have a few doses scheduled for today.
          </p>
        </div>
      </div>
    </div>
  );
}
