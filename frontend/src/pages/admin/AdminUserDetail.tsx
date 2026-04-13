import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Wallet, Tag } from "lucide-react";
import { adminApi, AdminUserDetailData } from "@/api/admin";
import { formatCurrency } from "@/lib/format";

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  UPCOMING: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  ONGOING: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  COMPLETED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    adminApi.getUserById(id)
      .then((res) => setUser(res.data))
      .catch(() => setError("Failed to load user information."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-white rounded-[2rem] border border-slate-100 shadow-sm" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100" />)}
      </div>
    </div>
  );

  if (error || !user) return (
    <div className="rounded-2xl bg-red-50 text-red-600 p-8 border border-red-100">
      <p className="font-bold text-lg mb-1">Error</p>
      <p className="text-sm opacity-80">{error || "User not found in system."}</p>
      <Link to="/admin/users" className="inline-block mt-4 text-sm font-bold underline">Return to Directory</Link>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Back breadcrumb - handled by Layout usually, but adding small link here */}
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-amber-600 transition-colors group">
        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
        Back to Users Directory
      </Link>

      {/* User Identity Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
              {user.role} Account
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="h-24 w-24 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-slate-900/10">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
            <p className="text-slate-500 font-medium">{user.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                Created {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Statistics & History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
             <MapPin className="h-5 w-5 text-amber-500" />
             Journey History ({user.trips.length})
          </h2>
        </div>

        {user.trips.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 border-dashed p-16 text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
               <Plane className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold tracking-tight text-lg">No trips recorded for this account</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {user.trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-amber-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-black text-slate-900 text-lg leading-none">{trip.title}</p>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[trip.status] ?? ''}`}>
                        {trip.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-300" />
                        {trip.destination.name}, {trip.destination.country}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-300" />
                        {new Date(trip.startDate).toLocaleDateString('en-IN')} — {new Date(trip.endDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 px-6 border-l border-slate-50 md:border-l">
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Budget Allocation</p>
                       <p className="text-xl font-black text-slate-900">{formatCurrency(trip.totalBudget)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
