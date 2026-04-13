import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, Map, Sparkles, Search, Package, Wallet, FolderLock, Bell, Settings,
  ChevronLeft, ChevronRight, LogOut, Crown, BellDot, User, Menu, X, Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/useAuth";

const navItems = [
  { label: "My Trips", icon: Map, path: "/dashboard" },
  { label: "AI Planner", icon: Sparkles, path: "/dashboard/planner" },
  { label: "Discover", icon: Search, path: "/dashboard/discover" },
  { label: "Bookings", icon: Package, path: "/dashboard/bookings" },
  { label: "Budget Tracker", icon: Wallet, path: "/dashboard/budget" },
  { label: "Document Vault", icon: FolderLock, path: "/dashboard/vault" },
  { label: "Alerts", icon: Bell, path: "/dashboard/alerts" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

export default function DashboardLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const currentPage = navItems.find((item) => isActive(item.path))?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 h-screen bg-card border-r border-border z-40 flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 p-4 h-16 border-b border-border flex-shrink-0">
          <Compass className="h-7 w-7 text-primary flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg font-bold text-foreground whitespace-nowrap"
              >
                TravelNest
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Explorer"}
              alt="User"
              className="h-9 w-9 rounded-full object-cover flex-shrink-0"
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
                  <div className="text-sm font-medium text-foreground truncate">{user?.name || 'Explorer'}</div>
                  <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">Pro</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* Admin Link (ADMIN role only) */}
        {user?.role === 'ADMIN' && (
          <div className="px-3 pb-4 flex-shrink-0">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-sm border border-amber-500/20 group"
            >
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 group-hover:bg-white/20 transition-colors">
                 <Shield className="h-4 w-4 text-white" />
              </div>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                  <span className="leading-none mb-1">Admin Console</span>
                  <span className="text-[10px] opacity-70 font-medium">Switch to System View</span>
                </motion.div>
              )}
            </Link>
          </div>
        )}

        {/* Upgrade Card */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 flex-shrink-0">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
                <Crown className="h-5 w-5 mb-2" />
                <div className="text-sm font-semibold mb-1">Upgrade to Pro</div>
                <div className="text-xs text-white/80 mb-3">Unlock unlimited AI itineraries</div>
                <button className="w-full py-1.5 rounded-lg bg-white/20 text-xs font-medium hover:bg-white/30 transition-colors">
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-border flex-shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs">
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{ 
          marginLeft: typeof window !== 'undefined' && window.innerWidth < 1024 ? 0 : (collapsed ? 72 : 260) 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 min-h-screen w-full"
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-card/80 glass-nav border-b border-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <Input
                placeholder="Search destinations, trips..."
                className="w-64 h-9 rounded-lg bg-muted border-0 text-sm"
              />
            </div>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <BellDot className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            <button className="p-1">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                alt="User"
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
