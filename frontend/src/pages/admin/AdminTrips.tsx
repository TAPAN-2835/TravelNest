import { useState, useEffect } from "react";
import { Plane, MapPin, Wallet, Tag, User } from "lucide-react";
import { adminApi, AdminTripData } from "@/api/admin";
import { formatCurrency } from "@/lib/format";

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  UPCOMING: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  ONGOING: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  COMPLETED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ALL_STATUSES = ["PLANNING", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

export default function AdminTrips() {
  const [trips, setTrips] = useState<AdminTripData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    adminApi.getTrips({ status: statusFilter || undefined })
      .then((res) => {
        setTrips(res.data);
        setTotal(res.pagination?.total ?? res.data.length);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filters & Actions */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              !statusFilter ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
            }`}
          >
            All Trips
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                statusFilter === s ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="hidden lg:block text-right px-4 shrink-0">
          <p className="text-sm font-bold text-slate-900">{total}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Filtered Trips</p>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden border-separate">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Trip Title</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Destination</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Valuation</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-8 py-6">
                      <div className="h-5 bg-slate-50 rounded-lg animate-pulse w-32" />
                    </td>
                  ))}
                </tr>
              ))
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-24 text-slate-400">
                  <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Plane className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-500 text-lg">No journeys found</p>
                  <p className="text-sm">Try adjusting your status filter</p>
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-900 leading-tight max-w-[220px] truncate">{trip.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {trip.id.split('-')[0]}</p>
                  </td>
                  <td className="px-8 py-6 hidden md:table-cell text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{trip.destination.name}, {trip.destination.country}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0 border border-slate-200">
                        {trip.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-none mb-1">{trip.user.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium hidden lg:block">{trip.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden lg:table-cell">
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <Wallet className="h-4 w-4 text-slate-400 font-normal" />
                      {formatCurrency(trip.totalBudget)}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[trip.status] ?? ''}`}>
                      {trip.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
