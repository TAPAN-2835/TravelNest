import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, LayoutDashboard, Users, Map, 
  BarChart3, Settings, ChevronLeft, 
  ChevronRight, LogOut, Bell, Menu, X, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";

const adminNavItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/admin" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Trips", icon: Map, path: "/admin/trips" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const currentLabel = adminNavItems.find(item => isActive(item.path))?.label || "Admin Console";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex transition-colors duration-300">
      {/* Admin Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        className="fixed top-0 left-0 h-screen bg-[#0F172A] text-slate-300 z-50 flex flex-col overflow-hidden border-r border-slate-800"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 h-16 border-b border-slate-800 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-white text-lg truncate">
              Admin Panel
            </motion.span>
          )}
        </div>

        {/* Back to App */}
        <div className="px-3 py-4 border-b border-slate-800 shrink-0">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 hover:text-white group`}
          >
            <ArrowLeft className="h-4 w-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            {!collapsed && <span className="truncate text-slate-400 group-hover:text-white">Exit Admin</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto mt-2">
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path) ? "text-white" : "text-slate-400"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="text-xs">Collapse Menu</span>}
          </button>
        </div>
      </motion.aside>

      {/* Content Area */}
      <div 
        className="flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <h2 className="text-lg font-bold text-slate-800">{currentLabel}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-1">Super Admin</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} alt="Admin" />
              </div>
            </div>
            
            <button 
              onClick={() => { logout(); navigate("/login"); }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
