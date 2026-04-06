import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 2000000, label: "Destinations Mapped", suffix: "+" , display: "2M+" },
  { value: 98, label: "AI Accuracy Rate", suffix: "%", display: "98%" },
  { value: 150, label: "Countries Covered", suffix: "+", display: "150+" },
  { value: 4.9, label: "Average Rating", suffix: "★", display: "4.9★" },
];

function AnimatedNumber({ target, suffix, display }: { target: number; suffix: string; display: string }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target]);

  const formatted = target >= 1000000
    ? `${(value / 1000000).toFixed(value >= target ? 0 : 1)}M`
    : target < 10
    ? value.toFixed(value >= target ? 1 : 1)
    : Math.round(value).toString();

  return (
    <div ref={ref} className="text-center px-6">
      <div className="text-3xl sm:text-4xl font-bold text-foreground">
        {started ? `${formatted}${suffix}` : display}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{stats.find(s => s.value === target)?.label}</div>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section className="py-16 border-y border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center divide-x divide-border">
          {stats.map((stat) => (
            <AnimatedNumber key={stat.label} target={stat.value} suffix={stat.suffix} display={stat.display} />
          ))}
        </div>
      </div>
    </section>
  );
}
