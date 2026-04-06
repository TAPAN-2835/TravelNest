import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, MapPin, Calendar, Trash2, Eye, GripVertical, Plane, Globe, Wallet, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/hooks/auth/useAuth";

interface Trip {
  id: string;
  name: string;
  destination: string;
  dates: string;
  progress: number;
  image: string;
  members: number;
}

const columns = [
  { id: "planning", title: "Planning", color: "bg-warning" },
  { id: "upcoming", title: "Upcoming", color: "bg-primary" },
  { id: "completed", title: "Completed", color: "bg-success" },
];

function TripCard({ trip, isDragging }: { trip: Trip; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: trip.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        className="bg-card rounded-xl border border-border shadow-card p-4 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start gap-3">
          <div {...listeners} className="mt-1 text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <img
            src={`https://images.unsplash.com/${trip.image}?w=60&h=60&fit=crop`}
            alt={trip.destination}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground truncate">{trip.name}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" /> {trip.destination}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Calendar className="h-3 w-3" /> {trip.dates}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Itinerary</span>
            <span>{trip.progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${trip.progress}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex -space-x-1">
            {Array.from({ length: trip.members }).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                <span className="text-[8px] text-muted-foreground font-medium">{String.fromCharCode(65 + i)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 text-muted-foreground hover:text-foreground"><Eye className="h-3.5 w-3.5" /></button>
            <button className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Record<string, any>>({
    planning: [],
    upcoming: [],
    completed: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const { tripsApi } = await import("@/api/trips");
      const { data } = await tripsApi.getTrips();
      
      const grouped = data.reduce((acc: any, trip: any) => {
        const status = trip.status.toLowerCase();
        if (acc[status]) {
          acc[status].push({
            ...trip,
            name: trip.destinationId,
            dates: `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`,
            progress: trip.itineraryId ? 100 : 0,
            image: "photo-1540959733332-eab4deabeeaf",
            members: 1
          });
        }
        return acc;
      }, { planning: [], upcoming: [], completed: [] });
      
      setTrips(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const findColumn = (id: string) => {
    for (const [col, items] of Object.entries(trips)) {
      if ((items as any[]).find((t) => t.id === id)) return col;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const handleDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeCol = findColumn(String(active.id));
    const overCol = findColumn(String(over.id)) || String(over.id);
    if (!activeCol || activeCol === overCol || !['planning', 'upcoming', 'completed'].includes(overCol)) return;

    setTrips((prev: any) => {
      const trip = prev[activeCol].find((t: any) => t.id === String(active.id))!;
      return {
        ...prev,
        [activeCol]: prev[activeCol].filter((t: any) => t.id !== String(active.id)),
        [overCol]: [...(prev[overCol] || []), { ...trip, status: overCol.toUpperCase() }],
      };
    });

    try {
      const { tripsApi } = await import("@/api/trips");
      await tripsApi.updateTripStatus(String(active.id), overCol.toUpperCase());
    } catch (err) {
      console.error(err);
      fetchTrips();
    }
  };

  const handleDragEnd = () => setActiveId(null);

  const activeTrip = activeId
    ? Object.values(trips).flat().find((t: any) => t.id === activeId)
    : null;

  const stats = [
    { label: "Trips Planned", value: "8", icon: Plane, color: "bg-primary/10 text-primary" },
    { label: "Countries Visited", value: "5", icon: Globe, color: "bg-secondary/10 text-secondary" },
    { label: "Total Distance", value: "24,500 km", icon: Route, color: "bg-accent/10 text-accent" },
    { label: "Money Saved", value: "₹18,000", icon: Wallet, color: "bg-success/10 text-success" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border border-border">
        <h2 className="text-xl font-semibold text-foreground">Good morning, {user?.name?.split(' ')[0] || 'Explorer'} ✦</h2>
        <p className="text-sm text-muted-foreground mt-1">You have 2 upcoming trips this month</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" className="rounded-full bg-primary text-primary-foreground text-xs h-8">
            <Plus className="h-3 w-3 mr-1" /> Plan New Trip
          </Button>
          <Button size="sm" variant="outline" className="rounded-full text-xs h-8">View Itinerary</Button>
          <Button size="sm" variant="outline" className="rounded-full text-xs h-8">Track Budget</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-card rounded-xl border border-border shadow-card p-4"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Kanban */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Active Trips</h3>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid md:grid-cols-3 gap-6">
            {columns.map((col) => (
              <div key={col.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <h4 className="text-sm font-medium text-foreground">{col.title}</h4>
                  <span className="text-xs text-muted-foreground">({trips[col.id]?.length || 0})</span>
                </div>
                <SortableContext items={trips[col.id]?.map((t) => t.id) || []} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3 min-h-[120px] p-2 rounded-xl border-2 border-dashed border-transparent hover:border-border transition-colors">
                    {trips[col.id]?.map((trip) => (
                      <TripCard key={trip.id} trip={trip} isDragging={trip.id === activeId} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
          <DragOverlay>
            {activeTrip ? (
              <div className="bg-card rounded-xl border border-primary shadow-elevated p-4 opacity-90 w-[300px]">
                <h4 className="text-sm font-semibold">{activeTrip.name}</h4>
                <p className="text-xs text-muted-foreground">{activeTrip.destination}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
