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

// Protected Route wrapper
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout wrapper component to handle routing context
const LayoutWrapper = ({ children, onLogout, isAuthenticated }) => {
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

// Main App Content with Routes
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      // If user is on login page but authenticated, redirect to home
      if (location.pathname === "/login") {
        navigate("/", { replace: true });
      }
    } else {
      // If user is not authenticated and not on login page, redirect to login
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    }
    setIsLoading(false);
  }, [location.pathname, navigate]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  // Show loading spinner during initial authentication check
  if (isLoading) {
    return <Loading text="Checking authentication..." />;
  }

  return (
    <>
      <Suspense fallback={<Loading text="Loading..." />}>
        <Routes>
          {/* Login Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Index onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <LayoutWrapper
                  onLogout={handleLogout}
                  isAuthenticated={isAuthenticated}
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/header-items" element={<HeaderItems />} />
                    <Route path="/po-line-items" element={<POLineItems />} />
                    <Route path="/source-data" element={<SourceData />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
};

const App = () => {
  return (
    <PurchaseOrderProvider>
      <POLineItemsProvider>
        <Router>
          <AppContent />
        </Router>
      </POLineItemsProvider>
    </PurchaseOrderProvider>
  );
};

export default App;
