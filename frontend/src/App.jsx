import React, { Suspense, lazy, useEffect, useState } from "react";
import { PurchaseOrderProvider } from "./contexts/PurchaseOrderContext.jsx";
import { POLineItemsProvider } from "./contexts/POLineItemsContext.jsx";
import { Toaster } from "@/components/ui/sonner";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Lazy load components
const Layout = lazy(() => import("./layout/Layout"));
const Index = lazy(() => import("./pages/Index"));
const Home = lazy(() => import("./pages/Home"));
const HeaderItems = lazy(() => import("./pages/HeaderItems"));
const POLineItems = lazy(() => import("./pages/POLineItems"));
const SourceData = lazy(() => import("./pages/SourceData"));
const Settings = lazy(() => import("./pages/Settings"));

const Loading = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex items-center space-x-3">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-600">{text}</span>
    </div>
  </div>
);

// Layout wrapper component
const LayoutWrapper = ({ children, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Layout
      onLogout={onLogout}
      currentPath={location.pathname}
      onNavigate={handleNavigation}
    >
      {children}
    </Layout>
  );
};

// Authenticated App Content - Only rendered when user is authenticated
const AuthenticatedApp = ({ onLogout }) => {
  return (
    <PurchaseOrderProvider>
      <POLineItemsProvider>
        <Suspense fallback={<Loading text="Loading application..." />}>
          <Routes>
            {/* Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <LayoutWrapper onLogout={onLogout}>
                  <Home />
                </LayoutWrapper>
              }
            />

            <Route
              path="/header-items"
              element={
                <LayoutWrapper onLogout={onLogout}>
                  <HeaderItems />
                </LayoutWrapper>
              }
            />

            <Route
              path="/po-line-items"
              element={
                <LayoutWrapper onLogout={onLogout}>
                  <POLineItems />
                </LayoutWrapper>
              }
            />

            <Route
              path="/source-data"
              element={
                <LayoutWrapper onLogout={onLogout}>
                  <SourceData />
                </LayoutWrapper>
              }
            />

            <Route
              path="/settings"
              element={
                <LayoutWrapper onLogout={onLogout}>
                  <Settings />
                </LayoutWrapper>
              }
            />

            {/* Catch all route - redirect to home for authenticated users */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </POLineItemsProvider>
    </PurchaseOrderProvider>
  );
};

// Unauthenticated App Content - Only login routes
const UnauthenticatedApp = ({ onLoginSuccess }) => {
  return (
    <Suspense fallback={<Loading text="Loading login..." />}>
      <Routes>
        <Route
          path="/login"
          element={<Index onLoginSuccess={onLoginSuccess} />}
        />
        {/* Redirect all other routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

// Main App Content with Authentication Logic
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Authentication check effect
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (token) {
          // Optional: Validate token with server
          // const isValidToken = await validateToken(token);
          // if (isValidToken) {
          setIsAuthenticated(true);

          // If user is on login page but authenticated, redirect to home
          if (location.pathname === "/login") {
            navigate("/", { replace: true });
          }
          // } else {
          //   // Token is invalid, remove it
          //   localStorage.removeItem("authToken");
          //   localStorage.removeItem("userInfo");
          //   setIsAuthenticated(false);
          //   navigate("/login", { replace: true });
          // }
        } else {
          setIsAuthenticated(false);
          // If user is not authenticated and not on login page, redirect to login
          if (location.pathname !== "/login") {
            navigate("/login", { replace: true });
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuthentication();
  }, [location.pathname, navigate]);

  // Handle successful login
  const handleLoginSuccess = (token, userInfo) => {
    // Store authentication data
    localStorage.setItem("authToken", token);
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }

    setIsAuthenticated(true);
    navigate("/", { replace: true });
  };

  // Handle logout
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");

    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  // Show loading spinner during initial authentication check
  if (isLoading || !authChecked) {
    return <Loading text="Checking authentication..." />;
  }

  // Render appropriate app based on authentication status
  return (
    <>
      {isAuthenticated ? (
        <AuthenticatedApp onLogout={handleLogout} />
      ) : (
        <UnauthenticatedApp onLoginSuccess={handleLoginSuccess} />
      )}
      <Toaster />
    </>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
