import { motion } from "framer-motion";
import { Sparkles, Wallet, Globe, Plane, FolderLock, Bell } from "lucide-react";
import { useRef, useState } from "react";

const features = [
  {
    icon: Sparkles,
    title: "AI Itinerary Generator",
    description: "Generate complete day-by-day travel plans in seconds with our smart AI engine.",
    color: "text-primary",
  },
  {
    icon: Wallet,
    title: "Smart Budget Tracker",
    description: "Track spending in real-time across currencies with automatic conversion.",
    color: "text-secondary",
  },
  {
    icon: Globe,
    title: "Destination Discovery",
    description: "Explore AI-curated destinations matching your travel style and preferences.",
    color: "text-accent",
  },
  {
    icon: Plane,
    title: "Hotel & Flight Search",
    description: "Compare and book from top providers instantly with best price guarantee.",
    color: "text-primary",
  },
  {
    icon: FolderLock,
    title: "Travel Document Vault",
    description: "Store passports, tickets, and visas securely on cloud with encryption.",
    color: "text-secondary",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description: "Weather, flight delays, and travel advisories delivered live to your dashboard.",
    color: "text-accent",
  },
];

function SpotlightCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="relative group"
    >
      {hovering && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-20 transition-opacity"
          style={{
            background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, hsl(var(--primary) / 0.15), transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-medium tracking-[0.08em] text-primary uppercase">Features</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mt-3">
            Everything You Need to Travel Smarter
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <SpotlightCard>
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="p-6 rounded-2xl bg-card border border-border shadow-card h-full transition-colors"
                >
                  <feature.icon className={`h-8 w-8 ${feature.color} mb-4`} />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
