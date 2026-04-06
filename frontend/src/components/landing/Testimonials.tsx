const testimonials = [
  { name: "Priya Sharma", trip: "Bali, Indonesia", rating: 5, quote: "TravelNest planned my entire Bali honeymoon in 10 minutes. The AI itinerary was spot on!", avatar: "photo-1494790108377-be9c29b29330" },
  { name: "James Wilson", trip: "Tokyo, Japan", rating: 5, quote: "The budget tracker saved me from overspending. I could see every expense in real-time across currencies.", avatar: "photo-1507003211169-0a1dd7228f2d" },
  { name: "Ananya Patel", trip: "Paris, France", rating: 5, quote: "Document vault is a lifesaver. All my visas, tickets, and hotel confirmations in one place.", avatar: "photo-1438761681033-6461ffad8d80" },
  { name: "Carlos Mendez", trip: "Santorini, Greece", rating: 5, quote: "Best travel app I've ever used. The AI suggestions were better than any travel agent.", avatar: "photo-1472099645785-5658abf4ff4e" },
  { name: "Sofia Chen", trip: "Dubai, UAE", rating: 5, quote: "Group trip planning was seamless. Everyone could see the itinerary and add their own activities.", avatar: "photo-1544005313-94ddf0286df2" },
  { name: "Ravi Kumar", trip: "New York, USA", rating: 5, quote: "Real-time flight delay alerts saved my connecting flight. TravelNest is indispensable.", avatar: "photo-1500648767791-00dcc994a43e" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <span key={i} className="text-warning text-sm">★</span>
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-[320px] p-5 rounded-2xl bg-card border border-border shadow-card mx-3">
      <StarRating rating={t.rating} />
      <p className="text-sm text-foreground mt-3 mb-4 leading-relaxed">"{t.quote}"</p>
      <div className="flex items-center gap-3">
        <img
          src={`https://images.unsplash.com/${t.avatar}?w=40&h=40&fit=crop&crop=face`}
          alt={t.name}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div>
          <div className="text-sm font-medium text-foreground">{t.name}</div>
          <div className="text-xs text-muted-foreground">{t.trip}</div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const doubledRow1 = [...testimonials, ...testimonials];
  const doubledRow2 = [...testimonials.slice(3), ...testimonials.slice(0, 3), ...testimonials.slice(3), ...testimonials.slice(0, 3)];

  return (
    <section className="py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 mb-12">
        <div className="text-center">
          <span className="text-xs font-medium tracking-[0.08em] text-primary uppercase">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mt-3">Travelers Love TravelNest</h2>
        </div>
      </div>

      {/* Row 1 - left scroll */}
      <div className="relative mb-6">
        <div className="flex animate-marquee">
          {doubledRow1.map((t, i) => (
            <TestimonialCard key={`r1-${i}`} t={t} />
          ))}
        </div>
      </div>

      {/* Row 2 - right scroll */}
      <div className="relative">
        <div className="flex animate-marquee-reverse">
          {doubledRow2.map((t, i) => (
            <TestimonialCard key={`r2-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
