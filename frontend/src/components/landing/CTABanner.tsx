import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CTABanner() {
  return (
    <section className="py-24 bg-primary/5 relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join 12,000+ travelers who use TravelNest to plan smarter, spend less, and travel more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 rounded-full px-5 bg-card border-border"
            />
            <Button className="h-12 rounded-full px-8 bg-accent hover:bg-accent/90 text-accent-foreground whitespace-nowrap">
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
