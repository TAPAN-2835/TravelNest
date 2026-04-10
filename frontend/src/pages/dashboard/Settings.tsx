import { Settings as SettingsIcon, User, Bell, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/auth/useAuth";
import { formatCurrency } from "@/lib/format";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" /> Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Profile</h3>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Explorer"} alt="User" className="h-16 w-16 rounded-full object-cover" />
          <Button variant="outline" size="sm" className="rounded-lg">Change Photo</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input defaultValue={user?.name || "Rahul Mehta"} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={user?.email || "rahul@example.com"} className="h-10 rounded-lg" disabled />
          </div>
        </div>
        <Button className="rounded-lg bg-primary text-primary-foreground">Save Changes</Button>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        </div>
        {["Flight updates", "Weather alerts", "Budget warnings", "Promotional emails"].map((item) => (
          <div key={item} className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">{item}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Security</h3>
        </div>
        <Button variant="outline" className="rounded-lg">Change Password</Button>
        <Button variant="outline" className="rounded-lg ml-3">Enable 2FA</Button>
      </div>

      {/* Billing */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Billing</h3>
        </div>
        <p className="text-sm text-muted-foreground">Current plan: <strong className="text-foreground">Pro — {formatCurrency(499)}/month</strong></p>
        <Button variant="outline" className="rounded-lg">Manage Subscription</Button>
      </div>
    </div>
  );
}
