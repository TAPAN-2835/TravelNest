import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Search, Sparkles, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const filters = ["Trending", "Budget", "Beach", "Mountains", "Culture", "Adventure"];

export default function Discover() {
  const [activeFilter, setActiveFilter] = useState("Trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [liked, setLiked] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const { destinationsApi } = await import("@/api/destinations");
      const response = await destinationsApi.getDestinations();
      const data = (response as any).destinations || (response as any).data?.destinations || response.data || [];
      setDestinations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const toggleLike = (id: string) => {
    setLiked((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dest.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "Trending") return matchesSearch;
    if (activeFilter === "Budget") return matchesSearch && dest.avgCostPerDay < 5000;
    
    const matchesCategory = dest.tags?.some((t: string) => t.toLowerCase() === activeFilter.toLowerCase()) || 
                            dest.description?.toLowerCase().includes(activeFilter.toLowerCase());
                            
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Discover Destinations</h2>
        <p className="text-sm text-muted-foreground mt-1">Explore AI-curated destinations from around the world</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search destinations..." 
            className="pl-9 h-10 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden relative border border-border">
                <Skeleton className="w-full h-full" />
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
             </div>
          ))}
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No destinations found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredDestinations.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -5 }}
              className="break-inside-avoid group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-md hover:shadow-xl transition-shadow duration-300">
                <img
                  src={dest.imageUrl || `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop`}
                  alt={dest.name}
                  className="w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 min-h-[280px]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-lg">
                    {dest.rating ? `${Math.round(dest.rating * 20)}% MATCH` : 'HIGH MATCH'}
                  </span>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(dest.id); }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
                >
                  <Heart className={`h-4 w-4 ${liked.includes(dest.id) ? "fill-destructive text-destructive" : "text-foreground"}`} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg font-bold text-white">{dest.name}</h3>
                  <p className="text-sm text-white/80">{dest.country}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-white/70 font-medium">Avg. cost: ₹{dest.avgCostPerDay?.toLocaleString('en-IN')}</p>
                    <button
                      onClick={() => navigate("/dashboard/planner", { state: { destination: `${dest.name}, ${dest.country}` } })}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/20 hover:bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-lg transition-colors border border-white/20"
                    >
                      <Sparkles className="h-3 w-3" /> PLAN
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
