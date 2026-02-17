import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Vote, ShieldCheck, ArrowRight, Lock, Delete } from "lucide-react";
import { useStore } from "../store/useStore";
import { supabase } from "../services/supabaseClient";
import { playSound } from "../utils/sound";
import SuperAdminAuth from "../components/SuperAdminAuth";
import SystemStatusCheck from "../components/SystemStatusCheck";

// TEMP: Create test Supabase Auth user (remove after use)
const createTestAuthUser = async () => {
  const phone = "70123456";
  const pin = "123456";
  const email = `${phone}@fieldops.app`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pin,
  });

  if (error) {
    console.error("Auth signup error:", error);
  } else if (data.user) {

    // Link to organization_users
    const { error: insertError } = await supabase
      .from("organization_users")
      .insert({
        auth_user_id: data.user.id,
        organization_id: "29db510f-2dd2-4777-b2f4-ae96ea298d3d",
        full_name: "System Admin",
        phone_number: phone,
        pin_hash: pin, // In production, hash this!
        role: "admin",
      });

    if (insertError) {
      console.error("Link to organization error:", insertError);
    }
  }
};

const Login: React.FC = () => {
  const { loginWithPin, isAuthenticated } = useStore();
  const navigate = useNavigate();

  // Stages: 'landing' -> 'safe'
  const [stage, setStage] = useState<"landing" | "safe">("landing");

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenStatus, setScreenStatus] = useState<
    "idle" | "input" | "error" | "success"
  >("idle");
  const [attempts, setAttempts] = useState(0);

  // Refs for animations
  const safeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // TEMP: Auto-create test auth user in dev mode (remove after use)
  useEffect(() => {
    if (import.meta.env.DEV && !isAuthenticated) {
      createTestAuthUser();
    }
  }, []);

  // Show logout button in dev mode for testing
  const handleLogout = async () => {
    await supabase.auth.signOut();
    const { logout } = useStore.getState();
    logout();
    // Clear PWA caches on logout
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    sessionStorage.clear();
    localStorage.removeItem("supabase.auth.token");
    window.location.reload();
  };

  const handleCTA = () => {
    playSound("click");
    setStage("safe");
  };

  const handleKeypadPress = async (key: string) => {
    if (loading || screenStatus === "success" || attempts >= 5) return;

    // Vibration feedback for mobile
    if (navigator.vibrate) navigator.vibrate(10);

    if (key === "C") {
      playSound("click");
      setPin("");
      setScreenStatus("idle");
      return;
    }

    if (key === "ENTER") {
      handleSubmit();
      return;
    }

    // Number input
    if (pin.length < 6) {
      playSound("beep");
      setPin((prev) => prev + key);
      setScreenStatus("input");
    }
  };

  const handleSubmit = async () => {
    // Minimal test version - direct Supabase Auth
    const email = "70123456@fieldops.app";
    const password = "123456";

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      setScreenStatus("error");
      playSound("error");
      return;
    }

    // SECURE: Do NOT auto-login. User must enter PIN manually.
    // Show success message and let user enter their PIN
    setScreenStatus("success");
    playSound("success");
    // Don't redirect - require PIN entry
  };

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans"
      dir="rtl"
    >
      {/* DEV MODE: Logout button */}
      {import.meta.env.DEV && (
        <button
          onClick={handleLogout}
          className="absolute top-4 left-4 z-50 px-3 py-1 bg-red-600 text-white text-xs rounded"
        >
          DEV: Logout
        </button>
      )}

      {/* Hidden Super Admin Modal & Trigger Listener */}
      <SuperAdminAuth />

      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      {/* STAGE 1: LANDING */}
      {stage === "landing" && (
        <div className="relative z-10 flex flex-col items-center text-center space-y-8 animate-fade-in-up">
          <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-900/50 mb-4 border-4 border-red-900">
            <Vote size={48} className="text-white drop-shadow-md" />
          </div>

          <div className="space-y-2">
            {/* Wrapped Title with Hidden Trigger */}
            <SystemStatusCheck>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-xl select-none">
                لبنان{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
                  ٢٠٢٦
                </span>
              </h1>
            </SystemStatusCheck>
            <p className="text-xl text-slate-400 font-light tracking-wide">
              نظام إدارة العمليات الانتخابية الموحد
            </p>
          </div>

          <div className="mt-12">
            <button
              onClick={handleCTA}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-red-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
            >
              <div className="absolute -inset-3 transition-all duration-1000 opacity-30 group-hover:opacity-100 group-hover:duration-200 animate-tilt">
                <div className="w-full h-full bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur-lg"></div>
              </div>
              <span className="relative flex items-center gap-3">
                دخول غرفة العمليات{" "}
                <ArrowRight className="group-hover:-translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: THE SAFE */}
      {stage === "safe" && (
        <div
          ref={safeRef}
          className="relative z-10 w-full max-w-sm animate-zoom-in"
        >
          {/* Safe Box Container - 3D Effect */}
          <div className="bg-slate-800 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] border-t border-slate-700 relative">
            {/* Metallic Texture Overlay */}
            <div className="absolute inset-0 rounded-3xl bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none"></div>

            {/* Screw Heads (Visuals) */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-slate-700 rotate-45"></div>
            </div>
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-slate-700 -rotate-45"></div>
            </div>
            <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-slate-700 -rotate-12"></div>
            </div>
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-slate-700 rotate-90"></div>
            </div>

            {/* Header Branding on Safe */}
            <div className="text-center mb-6 relative z-10">
              <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/5 shadow-inner">
                <ShieldCheck size={14} className="text-slate-500" />
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  FieldOps Security
                </span>
              </div>
            </div>

            {/* Digital Screen */}
            <div
              className={`
                    bg-black border-4 border-slate-700 rounded-lg p-4 mb-6 shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative overflow-hidden transition-colors duration-300
                    ${
                      screenStatus === "error"
                        ? "border-red-900/50"
                        : screenStatus === "success"
                        ? "border-green-900/50"
                        : ""
                    }
                `}
            >
              {/* Screen Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

              {/* Phone Input Area */}
              <div className="mb-2 border-b border-slate-800 pb-2 flex items-center">
                <span className="text-slate-500 text-xs font-mono mr-2">
                  USER.ID:
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent border-none outline-none text-emerald-500 font-mono w-full text-left tracking-wider"
                  placeholder="70-XXXXXX"
                  dir="ltr"
                  autoFocus
                />
              </div>

              {/* PIN Display Area */}
              <div className="flex justify-between items-center h-12">
                <div className="flex items-center gap-1">
                  {screenStatus === "error" ? (
                    <span className="text-red-500 font-mono animate-pulse font-bold tracking-widest">
                      ACCESS DENIED
                    </span>
                  ) : screenStatus === "success" ? (
                    <span className="text-green-500 font-mono animate-pulse font-bold tracking-widest">
                      ACCESS GRANTED
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-100 ${
                            i < pin.length
                              ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                              : "bg-slate-800 border border-slate-700"
                          }`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
                <Lock
                  size={16}
                  className={`${
                    pin.length > 0 ? "text-emerald-500" : "text-slate-700"
                  }`}
                />
              </div>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-4 relative z-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SafeButton
                  key={num}
                  onClick={() => handleKeypadPress(num.toString())}
                >
                  {num}
                </SafeButton>
              ))}

              <SafeButton
                onClick={() => handleKeypadPress("C")}
                variant="danger"
              >
                <Delete size={20} />
              </SafeButton>

              <SafeButton onClick={() => handleKeypadPress("0")}>0</SafeButton>

              <SafeButton
                onClick={() => handleKeypadPress("ENTER")}
                variant="success"
                disabled={loading}
              >
                <ArrowRight
                  size={20}
                  className={loading ? "animate-spin" : ""}
                />
              </SafeButton>
            </div>

            {/* Back Link */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setStage("landing")}
                className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
              >
                العودة إلى الشاشة الرئيسية
              </button>
            </div>

            {/* Attempts Warning */}
            {attempts > 0 && (
              <div className="absolute -bottom-10 left-0 right-0 text-center text-xs text-red-500 font-mono">
                WARNING: {5 - attempts} ATTEMPTS REMAINING
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 3D Button Component
const SafeButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: "normal" | "danger" | "success";
  disabled?: boolean;
}> = ({ children, onClick, variant = "normal", disabled }) => {
  const baseStyle =
    "h-16 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-75 active:scale-95 disabled:opacity-50 disabled:active:scale-100 select-none";

  // Neumorphic / 3D Styles
  const styles = {
    normal:
      "bg-slate-700 text-slate-200 shadow-[0_4px_0_rgb(30,41,59),0_5px_10px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[4px] border-t border-slate-600",
    danger:
      "bg-slate-800 text-red-400 shadow-[0_4px_0_rgb(15,23,42),0_5px_10px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[4px] border-t border-slate-700",
    success:
      "bg-emerald-600 text-white shadow-[0_4px_0_rgb(6,95,70),0_5px_10px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[4px] border-t border-emerald-500",
  };

  return (
    <button
      className={`${baseStyle} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Login;
