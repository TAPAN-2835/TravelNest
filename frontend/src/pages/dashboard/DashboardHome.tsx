import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MapPin, Calendar, Trash2, Eye, GripVertical, Plane, Globe, Wallet, Route, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTrips } from "@/hooks/trips/useTrips";
import { useQueryClient } from "@tanstack/react-query";

interface Trip {
  id: string;
  name: string;
  destination: string;
  dates: string;
  progress: number;
  image: string;
  fullImageUrl?: string;
  members: number;
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 min-h-[120px] p-2 rounded-xl border-2 border-dashed transition-colors ${
        isOver ? "border-primary/50 bg-primary/5" : "border-transparent hover:border-border"
      }`}
    >
      {children}
    </div>
  );
}

const columns = [
  { id: "planning", title: "Planning", color: "bg-warning" },
  { id: "upcoming", title: "Upcoming", color: "bg-primary" },
  { id: "completed", title: "Completed", color: "bg-success" },
];

function TripCard({ trip, isDragging, onDelete }: { trip: Trip; isDragging?: boolean; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: trip.id });
  const navigate = useNavigate();
  
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
            src={trip.fullImageUrl || `https://images.unsplash.com/${trip.image}?w=60&h=60&fit=crop`}
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
            <span>Progress</span>
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
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/trips/${trip.id}`); }}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your trip to {trip.destination}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(trip.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: tripsArray = [], isLoading: loading, refetch } = useTrips();

  const grouped = tripsArray.reduce((acc: any, trip: any) => {
    const status = (trip.status || 'planning').toLowerCase();
    const destName = typeof trip.destination === 'object' ? trip.destination?.name : (trip.destination || "Unknown");
    
    if (acc[status]) {
      acc[status].push({
        ...trip,
        name: trip.title || "Untitled Trip",
        destination: destName,
        dates: `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`,
        progress: trip.itineraryId ? 100 : 25,
        image: trip.coverImage || trip.destination?.imageUrl?.split('unsplash.com/')[1] || "photo-1540959733332-eab4deabeeaf",
        fullImageUrl: trip.coverImage || trip.destination?.imageUrl,
        members: trip.groupSize || 1,
        totalBudget: trip.totalBudget || 0
      });
    }
    return acc;
  }, { planning: [], upcoming: [], completed: [] });

  const trips = grouped;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const findColumn = (id: string) => {
    for (const [col, items] of Object.entries(trips)) {
      if ((items as any[]).find((t) => t.id === id)) return col;
    }
    return null;
  };

  const queryClient = useQueryClient();

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const activeCol = findColumn(String(active.id));
    const overCol = findColumn(String(over.id)) || String(over.id);
    if (!activeCol || activeCol === overCol || !['planning', 'upcoming', 'completed'].includes(overCol)) return;

    // Optimistic UI Update
    queryClient.setQueryData(["trips"], (oldData: any) => {
      const targetArray = Array.isArray(oldData) ? oldData : oldData?.data;
      if (!targetArray) return oldData;
      const updated = targetArray.map((t: any) => 
        t.id === active.id ? { ...t, status: overCol.toUpperCase() } : t
      );
      return Array.isArray(oldData) ? updated : { ...oldData, data: updated };
    });

    try {
      const { tripsApi } = await import("@/api/trips");
      await tripsApi.updateTripStatus(String(active.id), overCol.toUpperCase());
    } catch (err) {
      toast.error("Failed to update trip status");
      queryClient.invalidateQueries({ queryKey: ["trips"] }); // Revert on failure
    }
  };

  const handleDeleteTrip = async (id: string) => {
    try {
      const { tripsApi } = await import("@/api/trips");
      await tripsApi.deleteTrip(id);
      toast.success("Trip deleted successfully");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete trip");
    }
  };

  const allTripsArray = Object.values(trips).flat() as any[];
  const totalTrips = allTripsArray.length;
  const totalBudget = allTripsArray.reduce((acc, trip) => acc + (trip.totalBudget || 0), 0);
  const uniqueDestinations = new Set(allTripsArray.map(t => t.destination)).size;

  const stats = [
    { label: "Trips Planned", value: String(totalTrips), icon: Plane, color: "bg-primary/10 text-primary" },
    { label: "Places Explored", value: String(uniqueDestinations), icon: Globe, color: "bg-secondary/10 text-secondary" },
    { label: "Total Distance", value: `${totalTrips * 1250} km`, icon: Route, color: "bg-accent/10 text-accent" },
    { label: "Total Value", value: `₹${totalBudget.toLocaleString('en-IN')}`, icon: Wallet, color: "bg-success/10 text-success" },
  ];

  if (loading && tripsArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="text-sm text-muted-foreground mt-4 font-medium">Loading your travel pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border border-border">
        <h2 className="text-xl font-semibold text-foreground">Good day, {user?.name?.split(' ')[0] || 'Explorer'} ✦</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {totalTrips > 0 
            ? `You have ${trips.upcoming?.length || 0} upcoming trips. Ready for the next adventure?`
            : "No trips planned yet. Let's create your first dream itinerary!"}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            onClick={() => navigate("/dashboard/planner")}
            size="sm" className="rounded-full bg-primary text-primary-foreground text-xs h-8"
          >
            <Plus className="h-3 w-3 mr-1" /> Plan New Trip
          </Button>
          <Button 
            onClick={() => navigate("/dashboard/discover")}
            size="sm" variant="outline" className="rounded-full text-xs h-8"
          >
            Discover Places
          </Button>
          <Button 
            onClick={() => navigate("/dashboard/budget")}
            size="sm" variant="outline" className="rounded-full text-xs h-8"
          >
            Track Budget
          </Button>
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
        <h3 className="text-lg font-semibold text-foreground mb-4 font-outfit">Your Travel Pipeline</h3>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid md:grid-cols-3 gap-6">
            {columns.map((col) => (
              <div key={col.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <h4 className="text-sm font-medium text-foreground">{col.title}</h4>
                  <span className="text-xs text-muted-foreground">({loading ? '...' : (trips[col.id]?.length || 0)})</span>
                </div>
                
                <DroppableColumn id={col.id}>
                  <SortableContext items={trips[col.id]?.map((t: any) => t.id) || []} strategy={verticalListSortingStrategy}>
                    {loading && tripsArray.length === 0 ? (
                      Array.of(1, 2).map((i) => (
                        <div key={i} className="bg-card rounded-xl border border-border p-4 space-y-3">
                           <div className="flex gap-3">
                             <Skeleton className="w-12 h-12 rounded-lg" />
                             <div className="flex-1 space-y-2">
                               <Skeleton className="h-4 w-3/4" />
                               <Skeleton className="h-3 w-1/2" />
                             </div>
                           </div>
                           <Skeleton className="h-1.5 w-full rounded-full" />
                        </div>
                      ))
                    ) : trips[col.id]?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                        <Route className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">No trips here</p>
                      </div>
                    ) : (
                      trips[col.id]?.map((trip: any) => (
                        <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
                      ))
                    )}
                  </SortableContext>
                </DroppableColumn>
              </div>
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
