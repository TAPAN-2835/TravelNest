import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    monthlyPrice: "₹0",
    yearlyPrice: "₹0",
    description: "For casual travelers exploring one trip at a time.",
    features: ["1 AI itinerary / month", "Basic budget tracker", "3 destinations", "Community support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: "₹499",
    yearlyPrice: "₹3,999",
    description: "For frequent travelers who need the full suite of tools.",
    features: [
      "Unlimited AI itineraries",
      "Advanced budget tracker",
      "150+ destinations",
      "Document vault",
      "Real-time alerts",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Teams",
    monthlyPrice: "₹1,499",
    yearlyPrice: "₹11,999",
    description: "For groups and travel agencies managing multiple trips.",
    features: [
      "Everything in Pro",
      "Up to 20 team members",
      "Shared itineraries",
      "Team budget pooling",
      "Admin dashboard",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-medium tracking-[0.08em] text-primary uppercase">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mt-3">Simple, Transparent Pricing</h2>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className="relative w-14 h-7 rounded-full bg-muted p-1 transition-colors"
          >
            <motion.div
              animate={{ x: annual ? 26 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-5 h-5 rounded-full bg-primary"
            />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual <span className="text-secondary text-xs">Save 33%</span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`relative rounded-2xl p-6 bg-card border shadow-card ${
                plan.popular ? "border-primary ring-1 ring-primary" : "border-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium bg-primary text-primary-foreground px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-4 mb-2">
                <span className="text-3xl font-bold text-foreground">{annual ? plan.yearlyPrice : plan.monthlyPrice}</span>
                <span className="text-sm text-muted-foreground">/{annual ? "year" : "month"}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`w-full rounded-lg ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
