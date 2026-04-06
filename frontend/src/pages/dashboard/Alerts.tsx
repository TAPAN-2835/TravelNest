import { Bell, Plane, Cloud, AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";

const alerts = [
  { type: "flight", icon: Plane, title: "Flight AI-142 Delayed", description: "Your Delhi to Athens flight is delayed by 45 minutes. New departure: 10:45 AM.", time: "2 hours ago", severity: "warning" as const },
  { type: "weather", icon: Cloud, title: "Rain Expected in Santorini", description: "Light showers expected on Apr 13. Consider indoor activities.", time: "5 hours ago", severity: "info" as const },
  { type: "alert", icon: AlertTriangle, title: "Visa Expiring Soon", description: "Your Japan Tourist Visa expires on Jan 15, 2026. Renew before your next trip.", time: "1 day ago", severity: "danger" as const },
  { type: "info", icon: Info, title: "New AI Feature Available", description: "Try our new AI restaurant recommender for real-time dining suggestions.", time: "2 days ago", severity: "info" as const },
  { type: "flight", icon: Plane, title: "Check-in Open", description: "Web check-in is now open for IndiGo 6E-302. Check in before Apr 16.", time: "3 days ago", severity: "info" as const },
];

const severityStyles = {
  warning: "border-l-warning bg-warning/5",
  danger: "border-l-destructive bg-destructive/5",
  info: "border-l-primary bg-primary/5",
};

export default function Alerts() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> Travel Alerts
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Stay updated with real-time travel notifications</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-4 rounded-xl border border-border border-l-4 ${severityStyles[alert.severity]}`}
          >
            <div className="flex items-start gap-3">
              <alert.icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{alert.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
