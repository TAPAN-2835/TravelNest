import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/auth/useAuth";
import PrivateRoute from "./components/PrivateRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AIPlanner from "./pages/dashboard/AIPlanner";
import Discover from "./pages/dashboard/Discover";
import Bookings from "./pages/dashboard/Bookings";
import BudgetTracker from "./pages/dashboard/BudgetTracker";
import DocumentVault from "./pages/dashboard/DocumentVault";
import Alerts from "./pages/dashboard/Alerts";
import SettingsPage from "./pages/dashboard/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<PrivateRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="planner" element={<AIPlanner />} />
                <Route path="discover" element={<Discover />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="budget" element={<BudgetTracker />} />
                <Route path="vault" element={<DocumentVault />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Wrapper to avoid naming conflict
const DboardLayout = DashboardLayout;

export default App;
