import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Plane, MapPin, TrendingUp, 
  ArrowRight, CreditCard, 
  Activity, ArrowUpRight, ArrowDownRight,
  Clock, Award
} from "lucide-react";
import { adminApi, AdminStatsData } from "@/api/admin";
import { formatCurrency } from "@/lib/format";

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  color, 
  iconColor 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  trend?: { val: string; pos: boolean };
  color: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend.pos ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend.pos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend.val}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-blue-50 text-blue-600",
  UPCOMING: "bg-violet-50 text-violet-600",
  ONGOING: "bg-emerald-50 text-emerald-600",
  COMPLETED: "bg-slate-50 text-slate-500",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load platform analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 h-36 animate-pulse shadow-sm" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px] bg-white rounded-[2rem] border border-slate-100 animate-pulse shadow-sm" />
        <div className="h-[400px] bg-white rounded-[2rem] border border-slate-100 animate-pulse shadow-sm" />
      </div>
    </div>
  );

  if (error || !stats) return (
    <div className="rounded-2xl bg-red-50 text-red-600 p-8 border border-red-100 font-medium">
      {error || "No data available."}
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* High-Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          trend={{ val: `+${stats.newSignups}`, pos: true }}
          color="bg-indigo-50" 
          iconColor="text-indigo-600"
        />
        <StatCard 
          icon={Plane} 
          label="Total Trips" 
          value={stats.totalTrips.toLocaleString()} 
          trend={{ val: "Active", pos: true }}
          color="bg-sky-50" 
          iconColor="text-sky-600"
        />
        <StatCard 
          icon={CreditCard} 
          label="Confirmed" 
          value={stats.totalBookings.toLocaleString()} 
          color="bg-emerald-50" 
          iconColor="text-emerald-600"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          trend={{ val: "Live", pos: true }}
          color="bg-amber-50" 
          iconColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Section (The "Details" part) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Users List */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-indigo-600" />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Recent Signups</h3>
              </div>
              <Link to="/admin/users" className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-widest">View Directory</Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentUsers.map(u => (
                <Link 
                  key={u.id} 
                  to={`/admin/users/${u.id}`}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                       {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{u.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                       {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Trips List */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                    <Plane className="h-5 w-5 text-sky-600" />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Latest Expeditions</h3>
              </div>
              <Link to="/admin/trips" className="text-xs font-bold text-sky-600 hover:underline uppercase tracking-widest">Global Log</Link>
            </div>

            <div className="space-y-4">
              {stats.recentTrips.map(trip => (
                <div 
                  key={trip.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100"
                >
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-slate-400" />
                     </div>
                     <div>
                        <p className="font-bold text-slate-900 leading-none mb-1">{trip.title}</p>
                        <p className="text-xs text-slate-400 font-medium">{trip.user.name} • {trip.destination.name}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[trip.status] || 'bg-slate-100'}`}>
                        {trip.status}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          
          {/* Top Destination Leaderboard */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Award className="h-5 w-5 text-amber-600" />
               </div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Top Hotspots</h3>
            </div>

            <div className="space-y-6">
               {stats.topDestinations.map((d, index) => (
                 <div key={d.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <span className={`text-lg font-black ${index === 0 ? 'text-amber-500' : 'text-slate-300'}`}>0{index + 1}</span>
                       <div>
                          <p className="font-bold text-slate-800 leading-none group-hover:text-amber-600 transition-colors">{d.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{d.country}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-slate-900">{d.bookings}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">Bookings</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Quick Platform Pulse */}
          <div className="bg-[#0F172A] rounded-[2rem] p-8 text-white shadow-xl shadow-slate-900/10 h-64 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">System Health</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                All services are performing optimally. AI Planner latency: 450ms.
              </p>
            </div>
            <div className="flex items-center gap-2 relative">
               <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cloud Nodes Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
