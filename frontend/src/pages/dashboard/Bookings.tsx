import { Package } from "lucide-react";

const bookings = [
  { type: "Flight", name: "Air India AI-142", route: "Delhi → Athens", date: "Apr 10, 2026", status: "Confirmed", price: "₹35,000" },
  { type: "Hotel", name: "The Leela Palace", route: "Bangalore", date: "Apr 10–17, 2026", status: "Confirmed", price: "₹28,000" },
  { type: "Activity", name: "Scuba Diving Tour", route: "Santorini", date: "Apr 12, 2026", status: "Pending", price: "₹4,500" },
  { type: "Flight", name: "IndiGo 6E-302", route: "Athens → Delhi", date: "Apr 17, 2026", status: "Confirmed", price: "₹32,000" },
];

export default function Bookings() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> My Bookings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">View and manage all your travel bookings</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Type</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Name</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 hidden sm:table-cell">Route</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Date</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Price</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-4"><span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">{b.type}</span></td>
                <td className="p-4 text-sm font-medium text-foreground">{b.name}</td>
                <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{b.route}</td>
                <td className="p-4 text-sm text-muted-foreground">{b.date}</td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.status === "Confirmed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {b.status}
                  </span>
                </td>
                <td className="p-4 text-sm font-medium text-foreground">{b.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
