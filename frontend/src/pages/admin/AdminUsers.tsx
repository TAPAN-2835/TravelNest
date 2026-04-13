import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Search, ChevronRight, Mail, Briefcase, Shield } from "lucide-react";
import { adminApi, AdminUserData } from "@/api/admin";
import { Input } from "@/components/ui/input";

function useDebounce(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    adminApi.getUsers({ search: debouncedSearch })
      .then((res) => {
        setUsers(res.data);
        setTotal(res.pagination?.total ?? res.data.length);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search & Actions */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email or role..."
            className="pl-9 bg-slate-50 border-none h-11 rounded-xl focus-visible:ring-amber-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="hidden sm:block text-right px-4">
          <p className="text-sm font-bold text-slate-900">{total}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden border-separate">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Subscriber</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Contact</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Trips</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Joined</th>
              <th className="px-8 py-5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-8 py-6">
                      <div className="h-5 bg-slate-50 rounded-lg animate-pulse w-24" />
                    </td>
                  ))}
                  <td className="px-8 py-6" />
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-24 text-slate-400">
                  <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-500 text-lg">No explorers found matching your search</p>
                  <p className="text-sm">Try using different keywords</p>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-sm shrink-0 shadow-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-none mb-1">{u.name}</p>
                        <p className="text-xs text-slate-400 font-medium md:hidden">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'ADMIN' 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Shield className={u.role === 'ADMIN' ? "h-3 w-3" : "hidden"} />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Briefcase className="h-4 w-4 text-slate-400 font-normal" />
                      {u.totalTrips}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-medium hidden lg:table-cell">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white transition-all shadow-sm group-hover:shadow-md"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
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
