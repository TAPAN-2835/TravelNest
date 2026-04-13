import { Settings, Shield, Bell, Lock, Database, Globe } from "lucide-react";

export default function AdminSettings() {
  const sections = [
    { title: "System Security", desc: "Configure MFA and role-based access", icon: Shield },
    { title: "Platform Config", desc: "API keys and environmental variables", icon: Database },
    { title: "Notifications", desc: "System-wide email and push alert settings", icon: Bell },
    { title: "Audit Logs", desc: "View all administrative actions", icon: Lock },
    { title: "Localization", desc: "Currency and multi-language support", icon: Globe },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Global platform configuration and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((s) => (
          <div key={s.title} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-start gap-5 cursor-pointer">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-colors">
              <s.icon className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-1">{s.title}</p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button Placeholder */}
      <div className="pt-6 border-t border-slate-100">
         <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
            Save Global Configuration
         </button>
      </div>
    </div>
  );
}
