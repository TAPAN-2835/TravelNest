import { useState, useRef } from "react";
import { motion } from "framer-motion";

const tabs = ["All", "Asia", "Europe", "Americas", "Middle East"];

const destinations = [
  { city: "Santorini", country: "Greece", region: "Europe", cost: "₹1,20,000", img: "photo-1570077188670-e3a8d69ac5ff" },
  { city: "Bali", country: "Indonesia", region: "Asia", cost: "₹65,000", img: "photo-1537996194471-e657df975ab4" },
  { city: "Tokyo", country: "Japan", region: "Asia", cost: "₹1,50,000", img: "photo-1540959733332-eab4deabeeaf" },
  { city: "Dubai", country: "UAE", region: "Middle East", cost: "₹90,000", img: "photo-1512453979798-5ea266f8880c" },
  { city: "New York", country: "USA", region: "Americas", cost: "₹2,00,000", img: "photo-1496442226666-8d4d0e62e6e9" },
  { city: "Paris", country: "France", region: "Europe", cost: "₹1,40,000", img: "photo-1502602898657-3e91760cbb34" },
  { city: "Maldives", country: "Maldives", region: "Asia", cost: "₹1,80,000", img: "photo-1514282401047-d79a71a590e8" },
  { city: "Istanbul", country: "Turkey", region: "Middle East", cost: "₹55,000", img: "photo-1524231757912-21f4fe3a7200" },
];

export default function Destinations() {
  const [activeTab, setActiveTab] = useState("All");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = activeTab === "All" ? destinations : destinations.filter((d) => d.region === activeTab);

  return (
    <section id="destinations" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-medium tracking-[0.08em] text-primary uppercase">Destinations</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mt-3">Trending Right Now</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {filtered.map((dest, i) => (
            <motion.div
              key={dest.city}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.04 }}
              className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden h-[400px]">
                <img
                  src={`https://images.unsplash.com/${dest.img}?w=400&h=500&fit=crop`}
                  alt={dest.city}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-medium bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
                      AI Trips Available
                    </span>
                    <span className="text-[10px] font-medium bg-card/90 text-foreground px-2 py-0.5 rounded-full">
                      {dest.cost}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{dest.city}</h3>
                  <p className="text-sm text-white/80">{dest.country}</p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-sm font-medium text-white">Explore →</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
