import {
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png"; // ✅ Your logo
import { token_decode } from "@/utils/index"; 
const Layout = ({ onLogout, currentPath = "/", onNavigate, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = token_decode(token);
      setUserDetails(decoded || {});
    }
  }, []);
console.log(userDetails)
  const userName = userDetails?.name || userDetails?.username || "John Doe";
  const userEmail = userDetails?.email || "john@example.com";
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "JD";

  const menuItems = [
    { path: "/", label: "Home", icon: <Home size={20} /> },
    {
      path: "/header-items",
      label: "Header Items",
      icon: <FileText size={20} />,
    },
    {
      path: "/po-line-items",
      label: "PO Line Items",
      icon: <Package size={20} />,
    },
    {
      path: "/source-data",
      label: "Source Data",
      icon: <Database size={20} />,
    },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const handleMenuClick = (path) => {
    setSidebarOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    onLogout();
    setShowLogoutConfirm(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-64";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ✅ Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 min-h-[80px]">
          <div className={`flex items-center justify-center w-full`}>
            <div
              className={`${
                sidebarCollapsed ? "w-10 h-10" : "w-32 h-20"
              } flex-shrink-0`}
            >
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          {!sidebarCollapsed && (
            <div className="absolute right-4 flex items-center space-x-1">
              <button
                onClick={toggleSidebarCollapse}
                className="hidden lg:flex p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ✅ Navigation */}
        <nav className="flex-1 mt-6 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? "justify-center px-2" : "space-x-3 px-3"
                  } py-3 rounded-lg text-left transition-all duration-200 group ${
                    currentPath === item.path
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <span
                    className={`transition-colors ${
                      currentPath === item.path
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                  {currentPath === item.path && (
                    <div className="ml-auto w-1 h-6 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle Button at Bottom */}
        {sidebarCollapsed && (
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={toggleSidebarCollapse}
              className="w-full p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex justify-center"
              title="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ✅ Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {menuItems.find((item) => item.path === currentPath)?.label ||
                "Dashboard"}
            </h1>
          </div>

          {/* ✅ Profile in Header */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userInitials}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;