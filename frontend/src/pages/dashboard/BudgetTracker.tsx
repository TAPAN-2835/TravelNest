import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

const pieData = [
  { name: "Flights", value: 35000, color: "#6366f1" },
  { name: "Hotels", value: 28000, color: "#10b981" },
  { name: "Food", value: 12000, color: "#f59e0b" },
  { name: "Activities", value: 8000, color: "#ec4899" },
  { name: "Misc", value: 5000, color: "#94a3b8" },
];

const barData = [
  { day: "Day 1", amount: 18000 },
  { day: "Day 2", amount: 8500 },
  { day: "Day 3", amount: 12000 },
  { day: "Day 4", amount: 6500 },
  { day: "Day 5", amount: 15000 },
  { day: "Day 6", amount: 9000 },
  { day: "Day 7", amount: 19000 },
];

export default function BudgetTracker() {
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [tripExpenses, setTripExpenses] = useState<any[]>([]);

  const fetchBudget = async () => {
    try {
      const { budgetApi } = await import("@/api/budget");
      const tripId = "demo-trip-id";
      const { data } = await budgetApi.getBudget(tripId);
      setBudgetData(data);
      setTripExpenses(data.expenses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const handleDeleteExpense = async (id: string) => {
    try {
      const { budgetApi } = await import("@/api/budget");
      await budgetApi.deleteExpense("demo-trip-id", id);
      toast.success("Expense deleted");
      fetchBudget();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const totalBudget = budgetData?.limit || 120000;
  const totalSpent = tripExpenses.reduce((a, b: any) => a + (parseFloat(b.amount) || 0), 0);
  const percentage = Math.round((totalSpent / totalBudget) * 100);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Budget Tracker</h2>
        <p className="text-sm text-muted-foreground mt-1">Track your spending for the Greece Itinerary</p>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Total Budget</span>
          <span className="text-sm text-muted-foreground">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${percentage > 90 ? "bg-destructive" : percentage > 70 ? "bg-warning" : "bg-primary"}`}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{percentage}% of budget used • {formatCurrency(totalBudget - totalSpent)} remaining</p>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Daily Spending</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="hsl(227, 100%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Expenses</h3>
          <Button size="sm" className="rounded-lg bg-primary text-primary-foreground text-xs h-8">
            <Plus className="h-3 w-3 mr-1" /> Add Expense
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Category</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Description</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Date</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {tripExpenses.map((exp, i) => (
                <tr key={exp.id || i} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-3 text-sm">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{exp.category}</span>
                  </td>
                  <td className="p-3 text-sm text-foreground">{exp.description}</td>
                  <td className="p-3 text-sm font-medium text-foreground">{formatCurrency(exp.amount)}</td>
                  <td className="p-3 text-sm text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button onClick={() => handleDeleteExpense(exp.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
