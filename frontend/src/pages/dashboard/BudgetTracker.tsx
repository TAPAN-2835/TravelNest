import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Loader2, Wallet, Calendar, Tag, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#94a3b8", "#8b5cf6", "#ef4444"];

const CATEGORIES = ["Flights", "Hotels", "Food", "Activities", "Shopping", "Transport", "Misc"];

export default function BudgetTracker() {
  const [loading, setLoading] = useState(true);
  const [fetchingBudget, setFetchingBudget] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [budgetData, setBudgetData] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "Food",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const fetchTrips = async () => {
    try {
      const { tripsApi } = await import("@/api/trips");
      const { data } = await tripsApi.getTrips() as any;
      const tripsArray = Array.isArray(data) ? data : (data?.data || []);
      setTrips(tripsArray);
      if (tripsArray.length > 0) {
        setSelectedTripId(tripsArray[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const fetchBudget = async (tripId: string) => {
    if (!tripId) return;
    setFetchingBudget(true);
    try {
      const { budgetApi } = await import("@/api/budget");
      const { data } = await budgetApi.getBudget(tripId);
      setBudgetData(data);
    } catch (err) {
      console.error(err);
      setBudgetData(null);
    } finally {
      setFetchingBudget(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchBudget(selectedTripId);
    }
  }, [selectedTripId]);

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { budgetApi } = await import("@/api/budget");
      await budgetApi.addExpense(selectedTripId, {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: new Date(newExpense.date).toISOString()
      });
      toast.success("Expense added successfully");
      setIsAddOpen(false);
      setNewExpense({ category: "Food", amount: "", description: "", date: new Date().toISOString().split('T')[0] });
      fetchBudget(selectedTripId);
    } catch (err) {
      toast.error("Failed to add expense");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { budgetApi } = await import("@/api/budget");
      await budgetApi.deleteExpense(selectedTripId, expenseId);
      toast.success("Expense deleted");
      fetchBudget(selectedTripId);
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const totalBudget = budgetData?.totalAmount || 0;
  const totalSpent = budgetData?.totalSpent || 0;
  const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const pieData = budgetData?.categoryData || [];
  const barData = budgetData?.dailyData || [];
  const expenses = budgetData?.expenses || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Budget Tracker</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage finances for your travel adventures</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedTripId} onValueChange={setSelectedTripId}>
            <SelectTrigger className="w-[200px] h-10 rounded-lg">
              <SelectValue placeholder="Select a trip" />
            </SelectTrigger>
            <SelectContent>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  {trip.title || trip.destinationId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedTripId} className="rounded-lg bg-primary text-primary-foreground h-10 px-4 whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(val) => setNewExpense({...newExpense, category: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (INR)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="e.g. Flight to Mumbai" 
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddExpense}>Save Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedTripId ? (
        <div className="py-20 text-center bg-card rounded-2xl border border-dashed border-border">
          <Wallet className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No trip selected</h3>
          <p className="text-sm text-muted-foreground">Select a trip above to start tracking your budget</p>
        </div>
      ) : fetchingBudget ? (
          <div className="space-y-8 animate-pulse">
             <div className="h-32 bg-muted rounded-2xl" />
             <div className="grid lg:grid-cols-2 gap-6">
                <div className="h-64 bg-muted rounded-2xl" />
                <div className="h-64 bg-muted rounded-2xl" />
             </div>
          </div>
      ) : !budgetData ? (
        <div className="py-20 text-center bg-card rounded-2xl border border-dashed border-border">
          <Wallet className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No budget found</h3>
          <p className="text-sm text-muted-foreground">We couldn't find budget details for this trip. Try adding an expense!</p>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Total Budget Status</span>
              <span className="text-sm text-muted-foreground">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, percentage)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${percentage > 90 ? "bg-destructive" : percentage > 70 ? "bg-warning" : "bg-primary"}`}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {percentage}% of budget used • {totalBudget - totalSpent > 0 ? `${formatCurrency(totalBudget - totalSpent)} remaining` : "Over budget!"}
            </p>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h3>
              {pieData.length > 0 ? (
                <>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width={250} height={250}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                          {pieData.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {pieData.map((d: any, i: number) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-xs italic">No category data yet</div>
              )}
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Daily Spending Trend</h3>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip labelFormatter={(v) => `Date: ${v}`} formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-xs italic">No daily trend data yet</div>
              )}
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Transaction History</h3>
              <span className="text-xs text-muted-foreground">{expenses.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3 uppercase tracking-wider">Category</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3 uppercase tracking-wider">Description</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3 uppercase tracking-wider">Amount</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3 uppercase tracking-wider">Date</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground italic">No expenses recorded for this trip</td>
                    </tr>
                  ) : (
                    expenses.map((exp: any) => (
                      <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-sm">
                          <span className="px-2.5 py-1 rounded-full bg-muted text-[10px] font-bold uppercase tracking-tight text-foreground/70">{exp.category}</span>
                        </td>
                        <td className="p-3 text-sm text-foreground">{exp.description}</td>
                        <td className="p-3 text-sm font-semibold text-foreground">{formatCurrency(exp.amount)}</td>
                        <td className="p-3 text-sm text-muted-foreground font-mono">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="p-3">
                          <button 
                            onClick={() => handleDeleteExpense(exp.id)} 
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
