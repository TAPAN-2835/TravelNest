import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Tell AI Your Dream",
    description: "Enter your destination, travel dates, budget, and interests. Our AI understands natural language — just describe your ideal trip.",
  },
  {
    num: "02",
    title: "AI Builds Your Plan",
    description: "Get an instant personalized day-by-day itinerary with hotel suggestions, activities, and restaurant recommendations.",
  },
  {
    num: "03",
    title: "Travel & Track",
    description: "Use the dashboard to manage bookings, track expenses, store documents, and get real-time alerts throughout your journey.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-medium tracking-[0.08em] text-primary uppercase">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mt-3">
            Your Trip in 3 Simple Steps
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="relative text-center"
            >
              <div className="text-7xl font-bold text-muted/60 select-none mb-4">{step.num}</div>
              <div className="relative z-10 -mt-8">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm mb-4">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
