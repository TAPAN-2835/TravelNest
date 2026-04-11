import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Users, ChevronDown, ChevronUp, Clock, IndianRupee, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSaveTrip } from "@/hooks/trips/useTrips";

const tripStyles = ["🏖 Beach", "🏔 Adventure", "🎭 Culture", "🛍 Shopping", "🍽 Food", "💆 Wellness"];

const mockItinerary = [
  {
    day: "Day 1",
    title: "Arrival & Exploration",
    activities: [
      { time: "Morning", name: "Arrive at Kempegowda International Airport", duration: "2 hrs", cost: "—" },
      { time: "Afternoon", name: "Check in at The Leela Palace Bangalore", duration: "1 hr", cost: "₹12,000" },
      { time: "Evening", name: "Visit Lalbagh Botanical Garden", duration: "2 hrs", cost: "₹50" },
    ],
  },
  {
    day: "Day 2",
    title: "Cultural Immersion",
    activities: [
      { time: "Morning", name: "Bangalore Palace Tour", duration: "3 hrs", cost: "₹500" },
      { time: "Afternoon", name: "Lunch at MTR – Mavalli Tiffin Rooms", duration: "1.5 hrs", cost: "₹800" },
      { time: "Evening", name: "MG Road & Brigade Road Shopping", duration: "3 hrs", cost: "₹5,000" },
    ],
  },
  {
    day: "Day 3",
    title: "Nature & Relaxation",
    activities: [
      { time: "Morning", name: "Nandi Hills Sunrise Drive", duration: "4 hrs", cost: "₹1,500" },
      { time: "Afternoon", name: "Spa at The Leela Palace", duration: "2 hrs", cost: "₹4,000" },
      { time: "Evening", name: "Dinner at Karavalli – Gateway Hotel", duration: "2 hrs", cost: "₹3,000" },
    ],
  },
];

export default function AIPlanner() {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [budget, setBudget] = useState([50000]);
  const [groupSize, setGroupSize] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>("1");
  const [itinerary, setItinerary] = useState<any>(null);
  const [destination, setDestination] = useState("Bangalore, India");
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  });
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) => prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]);
  };

  const calculateDays = () => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const days = calculateDays();
      const { aiApi } = await import("@/api/ai");
      const { data } = await aiApi.generateItinerary({
        destination,
        days,
        budget: budget[0],
        interests: selectedStyles,
        countryPreference: "india-first",
      });
      setItinerary(data);
      setShowItinerary(true);
      toast.success("Itinerary generated successfully! ✨");
    } catch (err) {
      console.error(err);
      setError("AI Service is temporarily unavailable. Using fallback.");
      toast.error("AI Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveMutation = useSaveTrip();
  const dayCount = calculateDays();

  const handleSave = async () => {
    saveMutation.mutate({
      title: `Trip to ${destination}`,
      destination: destination,
      startDate: new Date(dateRange.start).toISOString(),
      endDate: new Date(dateRange.end).toISOString(),
      days: dayCount,
      totalBudget: budget[0],
      travelStyle: selectedStyles[0] || "Culture",
      itineraryData: itinerary,
    }, {
      onSuccess: () => {
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> AI Itinerary Generator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Tell us about your dream trip and let AI craft the perfect itinerary</p>
      </div>

      {/* Input Form */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Destination</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search destination..."
                className="pl-9 h-11 rounded-lg"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input 
                type="date" 
                className="h-11 rounded-lg" 
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input 
                type="date" 
                className="h-11 rounded-lg" 
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Budget: {formatCurrency(budget[0])}</Label>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{dayCount} Days</span>
          </div>
          <Slider value={budget} onValueChange={setBudget} min={10000} max={500000} step={5000} className="py-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹10,000</span>
            <span>₹5,00,000</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Trip Style (Select multiple)</Label>
          <div className="flex flex-wrap gap-2">
            {tripStyles.map((style) => (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${selectedStyles.includes(style)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
                  }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Group Size</Label>
          <div className="flex items-center gap-3">
            <button onClick={() => setGroupSize(Math.max(1, groupSize - 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">-</button>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{groupSize}</span>
            </div>
            <button onClick={() => setGroupSize(groupSize + 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">+</button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
            <div className="mt-0.5">⚠️</div>
            <div>
               <p className="font-semibold">Generation Error</p>
               <p className="opacity-80">{error}</p>
               <Button onClick={handleGenerate} variant="link" className="p-0 h-auto text-destructive underline mt-2">Try Again</Button>
            </div>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-base shadow-lg shadow-primary/20">
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Crafting your {dayCount}-day trip...
            </span>
          ) : (
            `Generate ${dayCount}-Day Itinerary ✨`
          )}
        </Button>
      </div>

      {/* Generated Itinerary */}
      <AnimatePresence>
        {showItinerary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">Your AI-Generated Itinerary</h3>
              <div className="flex gap-2">
                <Button onClick={() => setShowItinerary(false)} variant="ghost" size="sm">Reset</Button>
                <Button 
                  onClick={handleSave} 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="h-4 w-4" /> Save to Dashboard
                </Button>
              </div>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Estimated Total Cost</span>
                <span className="text-primary font-bold text-lg">{formatCurrency(itinerary?.totalEstimatedCost || budget[0])}</span>
              </div>
            </div>
            {itinerary?.days?.map((day: any) => (
              <div key={day.day} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <button
                  onClick={() => setExpandedDay(expandedDay === String(day.day) ? null : String(day.day))}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">Day {day.day}</span>
                    <span className="text-sm font-medium text-foreground">{day.theme}</span>
                  </div>
                  {expandedDay === String(day.day) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <AnimatePresence>
                  {expandedDay === String(day.day) && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {['morning', 'afternoon', 'evening'].map((timeSlot) => (
                          day[timeSlot] && (
                            <div key={timeSlot} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize whitespace-nowrap mt-0.5">
                                {timeSlot}
                              </span>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-foreground">{day[timeSlot].activity}</div>
                                <div className="text-xs text-muted-foreground">{day[timeSlot].place}</div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {day[timeSlot].duration}</span>
                                  <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {formatCurrency(day[timeSlot].cost)}</span>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showItinerary && itinerary?.flights?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mt-4">Recommended Flights ✈️</h3>
            <div className="grid gap-4">
              {itinerary.flights.map((flight: any, idx: number) => (
                <div key={idx} className="bg-card p-4 rounded-xl border border-border shadow-card flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-primary">{flight.airline}</h4>
                    <p className="text-sm text-muted-foreground">{flight.departure} &rarr; {flight.arrival}</p>
                    <p className="text-sm text-muted-foreground">Class: {flight.travel_class} | Stops: {flight.stops}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{String(flight.price).includes('₹') ? flight.price : `₹${flight.price}`}</div>
                    <div className="text-sm text-muted-foreground">{flight.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showItinerary && itinerary?.hotels?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mt-4">Recommended Hotels 🏨</h3>
            <div className="grid gap-4">
              {itinerary.hotels.map((hotel: any, idx: number) => (
                <div key={idx} className="bg-card p-4 rounded-xl border border-border shadow-card flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-primary">{hotel.name}</h4>
                    <p className="text-sm text-muted-foreground">{hotel.location}</p>
                    <p className="text-sm text-muted-foreground">Rating: {hotel.rating} ⭐</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{String(hotel.price).includes('₹') ? hotel.price : `₹${hotel.price}`}</div>
                    <div className="text-sm text-muted-foreground">per night</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
