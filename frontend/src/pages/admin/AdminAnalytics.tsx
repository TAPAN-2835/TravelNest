import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line, Legend
} from 'recharts';
import { adminApi } from "@/api/admin";
import { TrendingUp, Users, CreditCard, Activity } from "lucide-react";

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.getAnalytics()
      .then((res) => {
        setData(res.data.timeSeries);
      })
      .catch(() => setError("Failed to load analytics engine."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><Activity className="h-10 w-10 text-amber-500 animate-spin" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Analytics</h1>
        <p className="text-slate-500 font-medium mt-1">Deep-dive into platform growth and financial performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Growth Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">User Acquisition</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Volume Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Booking Volume</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="bookings" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Revenue Trajectory (INR)</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
