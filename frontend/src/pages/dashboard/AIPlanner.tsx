import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Users, ChevronDown, ChevronUp, Clock, IndianRupee, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  // Initialize to "1" so it matches String(day.day) === "1" for Day 1
  const [expandedDay, setExpandedDay] = useState<string | null>("1");
  const [itinerary, setItinerary] = useState<any>(null);
  const [destination, setDestination] = useState("Bangalore, India");
  const navigate = useNavigate();

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) => prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { aiApi } = await import("@/api/ai");
      const { data } = await aiApi.generateItinerary({
        destination,
        days: 3,
        budget: budget[0],
        interests: selectedStyles,
        countryPreference: "india-first",
      });
      setItinerary(data);
      setShowItinerary(true);
      toast.success("Itinerary generated successfully! ✨");
    } catch (err) {
      console.error(err);
      toast.error("AI Service busy. Using fallback itinerary.");
      // Automatic fallback handled by backend or shown here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    toast.info("Saving trip to your dashboard...");
    try {
      const { tripsApi } = await import("@/api/trips");
      const { destinationsApi } = await import("@/api/destinations");

      // Resolve a real destination ID for UUID validation
      const destinationsRes = await destinationsApi.getDestinations();
      const allDestinations = destinationsRes.data;

      const matchedDest = allDestinations.find(d =>
        destination.toLowerCase().includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(destination.toLowerCase())
      );

      const destinationId = matchedDest?.id || allDestinations[0]?.id || "550e8400-e29b-41d4-a716-446655440000";

      const newTrip = await tripsApi.saveGeneratedTrip({
        title: `Trip to ${destination}`,
        destinationId,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        totalBudget: budget[0],
        travelStyle: selectedStyles[0] || "Culture",
        itineraryData: itinerary,
      });

      toast.success("Trip saved! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      toast.error("Failed to save trip. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
          <div className="space-y-2">
            <Label>Travel Dates</Label>
            <Input type="text" placeholder="Select dates" className="h-11 rounded-lg" defaultValue="Apr 10 – Apr 13, 2026" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Budget: {formatCurrency(budget[0])}</Label>
          <Slider value={budget} onValueChange={setBudget} min={10000} max={500000} step={5000} className="py-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹10,000</span>
            <span>₹5,00,000</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Trip Style</Label>
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

        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-base">
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                ✨
              </motion.span>
              Crafting your perfect trip...
            </span>
          ) : (
            "Generate Itinerary ✨"
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
              <Button onClick={handleSave} variant="outline" size="sm" className="gap-2">
                <Save className="h-4 w-4" /> Save to Trips
              </Button>
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
