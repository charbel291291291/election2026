import React, { useEffect, Suspense, lazy, useState, useCallback } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import OnboardingTour from "./components/OnboardingTour";
import { useStore } from "./store/useStore";
import { supabase } from "./services/supabaseClient";
import Login from "./pages/Login";
import { Loader2 } from "lucide-react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const FieldInput = lazy(() => import("./pages/FieldInput"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Resources = lazy(() => import("./pages/Resources"));
const MessageTesting = lazy(() => import("./pages/MessageTesting"));
const Simulation = lazy(() => import("./pages/Simulation"));
const WhatsAppCommandCenter = lazy(
  () => import("./pages/WhatsAppCommandCenter")
);
const ElectoralIntelligence = lazy(
  () => import("./pages/ElectoralIntelligence")
);
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));

// Lazy load ThreeBackground
const ThreeBackground = lazy(() => import("./components/ThreeBackground"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-full bg-slate-950">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-red-900 border-t-red-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const isValidating = useStore((state) => state.isValidating);
  const location = useLocation();

  // Show loading while validating session with server
  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-900 border-t-red-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Must be authenticated to access protected routes
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const SuperAdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isSuperAdmin } = useStore();
  // If not super admin, redirect to dashboard or login
  return isSuperAdmin ? <>{children}</> : <Navigate to="/" />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/field" element={<FieldInput />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/messages" element={<MessageTesting />} />
        <Route path="/whatsapp" element={<WhatsAppCommandCenter />} />
        <Route path="/legal" element={<ElectoralIntelligence />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/team" element={<TeamManagement />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const ProtectedRoutes = () => (
  <PrivateRoute>
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedRoutes />
      </Suspense>
    </Layout>
  </PrivateRoute>
);

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setUser, setIsValidating } = useStore();

  // SECURE: Validate session with server on every app load
  useEffect(() => {
    const validateSession = async () => {
      setIsValidating(true);

      try {
        // Clear any potentially stale cached auth state
        // PWA fix: Don't trust localStorage alone
        sessionStorage.removeItem("pwa_auth_bypass");

        // Simple session check with timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timeout")), 5000)
        );

        const sessionPromise = supabase.auth.getSession();

        const {
          data: { session },
          error: sessionError,
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any;

        if (sessionError) {
          console.error("Session validation error:", sessionError);
          // Don't call logout - just reset state
          useStore.setState({ isAuthenticated: false, isValidating: false });
          setIsInitializing(false);
          setIsValidating(false);
          return;
        }

        if (!session) {
          // No valid session - require login
          useStore.setState({ isAuthenticated: false });
        } else {
          // Session exists but we DON'T auto-login
          // User MUST enter PIN to access dashboard
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
          // Clear isAuthenticated - requires PIN verification
          useStore.setState({ isAuthenticated: false });
        }
      } catch (error) {
        console.error("Auth validation failed:", error);
        // On error, default to not authenticated
        useStore.setState({ isAuthenticated: false });
      } finally {
        setIsInitializing(false);
        setIsValidating(false);
      }
    };

    // Small delay to ensure store is ready
    setTimeout(() => validateSession(), 100);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        useStore.setState({ isAuthenticated: false, isSuperAdmin: false });
        // Clear PWA cache on sign out
        if ("caches" in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
      } else if (session) {
        // Update user but DON'T set authenticated - PIN required
        setUser({
          id: session.user.id,
          email: session.user.email,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setIsValidating]);

  // Show loading screen during initial session validation
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-900 border-t-red-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Standalone Super Admin Route - requires both auth AND super admin status */}
        <Route
          path="/system-root"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          }
        />

        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>

      {/* Onboarding Tour - runs only on first visit */}
      <OnboardingTour />
    </HashRouter>
  );
};

export default App;
