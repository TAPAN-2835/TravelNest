import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      // Simple float handled by CSS animation
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.3 + i * 0.08, duration: 0.5, ease: "easeOut" as const },
    }),
  };

  const headingWords = "Plan Your Dream Trip in Minutes, Not Hours".split(" ");

  return (
    <section className="relative min-h-screen flex items-center dot-grid-bg pt-16">
      <div className="container mx-auto px-4 lg:px-8 py-24">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-3 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-xs font-medium tracking-wide"
            >
              <span>✦</span> AI-Powered Travel Planning
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] text-foreground">
              {headingWords.map((word, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariants}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              TravelNest uses AI to generate personalized itineraries, track budgets,
              discover destinations, and manage every detail of your journey — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg text-base px-8 h-12"
              >
                <Link to="/signup">Start Planning for Free →</Link>
              </Button>
              <Button variant="ghost" size="lg" className="gap-2 text-base h-12">
                <Play className="h-4 w-4" /> Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="flex items-center gap-3 pt-2"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={`https://images.unsplash.com/photo-${
                      [
                        "1494790108377-be9c29b29330",
                        "1507003211169-0a1dd7228f2d",
                        "1438761681033-6461ffad8d80",
                        "1472099645785-5658abf4ff4e",
                        "1544005313-94ddf0286df2",
                      ][i - 1]
                    }?w=40&h=40&fit=crop&crop=face`}
                    alt="Traveler"
                    className="h-8 w-8 rounded-full border-2 border-card object-cover"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">12,000+</strong> travelers trust TravelNest
              </span>
            </motion.div>
          </div>

          {/* Right Floating Card */}
          <div className="lg:col-span-2 relative hidden lg:flex justify-center">
            {/* Background offset cards */}
            <div className="absolute top-8 -left-4 w-64 h-80 rounded-2xl bg-secondary/10 border border-secondary/20 rotate-[-6deg]" />
            <div className="absolute top-12 left-4 w-64 h-80 rounded-2xl bg-primary/5 border border-primary/10 rotate-[3deg]" />

            {/* Main card */}
            <motion.div
              ref={cardRef}
              initial={{ y: 20, opacity: 0, rotate: 0 }}
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 1, -1, 0],
                opacity: 1 
              }}
              transition={{ 
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.8 }
              }}
              whileHover={{ scale: 1.02, rotate: 0 }}
              className="relative z-10 w-72 rounded-2xl bg-card border border-border shadow-elevated overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=200&fit=crop"
                alt="Santorini"
                className="w-full h-40 object-cover"
              />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    AI Generated
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">7-Day Greece Itinerary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Budget</span>
                    <span>₹1,20,000</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-primary rounded-full" />
                  </div>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {["Day 1", "Day 2", "Day 3", "Day 4"].map((d) => (
                    <span
                      key={d}
                      className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                    >
                      {d}
                    </span>
                  ))}
                  <span className="text-[10px] font-medium text-muted-foreground">+3</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
