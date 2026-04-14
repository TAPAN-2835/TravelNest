import { useParams, useNavigate } from "react-router-dom";
import { useTrip } from "@/hooks/trips/useTrips";
import { Loader2, ArrowLeft, MapPin, Calendar, Wallet, Clock, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ImageLightbox } from "@/components/dashboard/ImageLightbox";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tripResponse, isLoading, isError } = useTrip(id || "");
  const trip = tripResponse?.data || tripResponse;
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="text-sm text-muted-foreground mt-4 font-medium">Loading your trip itinerary...</p>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed border-border">
        <h3 className="text-lg font-medium text-destructive">Trip not found</h3>
        <p className="text-sm text-muted-foreground mt-2">The trip you requested does not exist or you don't have access.</p>
        <Button onClick={() => navigate("/dashboard")} variant="outline" className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  const { itineraryData, budgetBreakdown, destination } = trip as any;

  return (
    <>
      <div className="w-full space-y-12 pb-20 px-4 md:px-10 lg:px-16">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate("/dashboard")} variant="ghost" size="icon" className="h-10 w-10 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{trip.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {destination?.name || trip.destinationId}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Wallet className="h-4 w-4" /> {formatCurrency(trip.totalBudget)}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2">Day-wise Itinerary</h3>
            {(!itineraryData?.days || itineraryData.days.length === 0) && (
              <p className="text-muted-foreground text-sm italic">No itinerary data found for this trip.</p>
            )}
            {itineraryData?.days?.map((day: any, idx: number) => (
              <div key={idx} className="bg-card rounded-3xl border border-border shadow-card overflow-hidden p-8 space-y-6">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-2xl font-black text-primary">Day {day.day}</span>
                  <span className="text-lg font-bold text-foreground">{day.theme}</span>
                </div>

                {['morning', 'afternoon', 'evening'].map((timeSlot) => (
                  day[timeSlot] && (
                    <div key={timeSlot} className="flex items-start gap-4 p-4 rounded-lg bg-muted/40">
                      <span className="text-xs font-bold tracking-wider text-primary bg-primary/10 px-2 py-1 rounded w-24 text-center capitalize shrink-0">
                        {timeSlot}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">{day[timeSlot].activity}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{day[timeSlot].place}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5 min-w-[70px]"><Clock className="h-3.5 w-3.5 text-secondary" /> {day[timeSlot].duration}</span>
                          <span className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5 text-success" /> {formatCurrency(String(day[timeSlot].cost).replace(/[^0-9]/g, ''))}</span>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ))}

            <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2 pt-6">Flight Recommendations</h3>
            {(!itineraryData?.flights || itineraryData.flights.length === 0) && (
              <p className="text-muted-foreground text-sm italic">No flights recommended.</p>
            )}
            <div className="grid gap-4">
              {itineraryData?.flights?.map((flight: any, idx: number) => (
                <div key={idx} className="bg-card p-5 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">{flight.airline}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{flight.departure} &rarr; {flight.arrival}</p>
                    <p className="text-xs text-muted-foreground">{flight.travel_class} • {flight.stops}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary tracking-wide">{formatCurrency(String(flight.price).replace(/[^0-9]/g, ''))}</div>
                    <div className="text-xs text-muted-foreground">{flight.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Budget Breakdown</h3>
              {budgetBreakdown ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Hotel Stay</span>
                    <span className="font-semibold">{formatCurrency(budgetBreakdown.stay)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Food & Dining</span>
                    <span className="font-semibold">{formatCurrency(budgetBreakdown.food)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Transport</span>
                    <span className="font-semibold">{formatCurrency(budgetBreakdown.travel)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Activities</span>
                    <span className="font-semibold">{formatCurrency(budgetBreakdown.activities)}</span>
                  </div>
                  <div className="pt-4 border-t border-border flex justify-between items-center bg-muted/20 -mx-6 px-6 pb-2 mt-4 rounded-b-xl">
                    <span className="font-bold text-foreground">Total Expected</span>
                    <span className="font-bold text-primary text-xl">{formatCurrency(trip.totalBudget)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">No budget distribution available.</p>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Recommended Hotels</h3>
              {(!itineraryData?.hotels || itineraryData.hotels.length === 0) && (
                <p className="text-muted-foreground text-sm italic">No hotels found.</p>
              )}
              <div className="space-y-4">
                {itineraryData?.hotels?.map((hotel: any, idx: number) => (
                  <div key={idx} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-sm text-foreground">{hotel.name}</h4>
                    <div className="flex justify-between items-end mt-2">
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {hotel.location}</span>
                        <span className="text-xs text-warning font-medium">★ {hotel.rating} Rating</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-primary text-sm">{formatCurrency(String(hotel.price).replace(/[^0-9]/g, ''))}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Per Night</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12 py-16 border-t border-border mt-16">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h3 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4">Journey Highlights 📸</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">Captured glimpses from your unique itinerary</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 w-full px-4">
            {(trip as any).itineraryPlaces?.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-6 group">
                <motion.div 
                  onClick={() => setSelectedImage({ url: item.imageUrl, name: item.name })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full aspect-square rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-muted cursor-zoom-in border-8 border-white dark:border-zinc-900 transition-all duration-500 hover:shadow-primary/20"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </motion.div>
                <div className="px-4">
                   <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-2 opacity-70">Scenic Highlight</p>
                   <h4 className="text-2xl font-bold text-foreground leading-tight tracking-tight">{item.name}</h4>
                   <p className="text-xs text-muted-foreground mt-3 font-semibold opacity-40 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                     <span className="h-px w-6 bg-primary/30" /> View details
                   </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ImageLightbox
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ""}
        imageName={selectedImage?.name || ""}
      />
    </>
  );
}
