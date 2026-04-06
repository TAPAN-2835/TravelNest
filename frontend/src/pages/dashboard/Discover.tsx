import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const filters = ["Budget", "Trending", "Beach", "Mountains", "Culture", "Adventure"];

const destinations = [
  { city: "Santorini", country: "Greece", cost: "₹1,20,000", score: 95, img: "photo-1570077188670-e3a8d69ac5ff", h: 400 },
  { city: "Bali", country: "Indonesia", cost: "₹65,000", score: 92, img: "photo-1537996194471-e657df975ab4", h: 320 },
  { city: "Kyoto", country: "Japan", cost: "₹1,10,000", score: 94, img: "photo-1493976040374-85c8e12f0c0e", h: 360 },
  { city: "Marrakech", country: "Morocco", cost: "₹45,000", score: 88, img: "photo-1489749798305-4fea3ae63d43", h: 380 },
  { city: "Reykjavik", country: "Iceland", cost: "₹1,80,000", score: 91, img: "photo-1504829857797-ddff29c27927", h: 340 },
  { city: "Cape Town", country: "South Africa", cost: "₹85,000", score: 90, img: "photo-1580060839134-75a5edca2e99", h: 420 },
  { city: "Lisbon", country: "Portugal", cost: "₹72,000", score: 93, img: "photo-1558618666-fcd25c85f82e", h: 300 },
  { city: "Cusco", country: "Peru", cost: "₹95,000", score: 89, img: "photo-1526392060635-9d6019884377", h: 370 },
  { city: "Bangkok", country: "Thailand", cost: "₹35,000", score: 87, img: "photo-1508009603885-50cf7c579365", h: 330 },
];

export default function Discover() {
  const [activeFilter, setActiveFilter] = useState("Trending");
  const [liked, setLiked] = useState<string[]>([]);

  const toggleLike = (city: string) => {
    setLiked((prev) => prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Discover Destinations</h2>
        <p className="text-sm text-muted-foreground mt-1">Explore AI-curated destinations from around the world</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search destinations..." className="pl-9 h-10 rounded-lg" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {destinations.map((dest, i) => (
          <motion.div
            key={dest.city}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="break-inside-avoid group cursor-pointer"
          >
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-md hover:shadow-xl transition-shadow duration-300">
              <img
                src={`https://images.unsplash.com/${dest.img}?w=400&h=${dest.h}&fit=crop`}
                alt={dest.city}
                className="w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                style={{ height: dest.h }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-lg">
                  {dest.score}% MATCH
                </span>
                {i < 3 && (
                  <span className="text-[10px] font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full shadow-lg">
                    TRENDING
                  </span>
                )}
              </div>

              {/* Heart */}
              <button
                onClick={() => toggleLike(dest.city)}
                className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
              >
                <Heart className={`h-4 w-4 ${liked.includes(dest.city) ? "fill-destructive text-destructive" : "text-foreground"}`} />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-bold text-white">{dest.city}</h3>
                <p className="text-sm text-white/80">{dest.country}</p>
                <p className="text-xs text-white/70 mt-1">Avg. cost: {dest.cost}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
