import { Bell, MapPin, Calendar, Cloud, Thermometer, Loader2, CloudSun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { alertsApi, WeatherAlert } from "../../api/alerts";
import { format } from "date-fns";

export default function Alerts() {
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await alertsApi.getWeatherAlerts();
        if (response.success) {
          setWeatherAlerts(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch weather alerts:", err);
        setError("Could not load weather alerts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium">Fetching real-time weather forecasts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" /> Weather Alerts
        </h2>
        <p className="text-sm text-muted-foreground">
          Real-time weather forecasts for your upcoming trips starting within the next 5 days.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 text-center"
          >
            <p className="text-sm text-destructive font-medium">{error}</p>
          </motion.div>
        ) : weatherAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center bg-muted/30"
          >
            <CloudSun className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No upcoming trips for weather alerts</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Alerts only show for trips within the next 5 days. Start planning your next adventure!
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {weatherAlerts.map((alert, tripIdx) => (
              <motion.div
                key={alert.tripId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tripIdx * 0.1 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Decorative Background Gradient */}
                <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-primary/10 blur-3xl rounded-full" />
                
                <div className="p-6">
                  {/* Trip Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Destination</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{alert.destination}</h3>
                    </div>
                    
                    <div className="px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div className="text-xs">
                        <p className="text-muted-foreground leading-none">Trip Dates</p>
                        <p className="font-semibold text-foreground mt-1 text-[11px]">
                          {format(new Date(alert.startDate), 'dd MMM')} – {format(new Date(alert.endDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Forecast Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {alert.forecast.map((f, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -4 }}
                        className="p-4 rounded-2xl bg-background/60 border border-border/50 flex items-center gap-4 group/card hover:border-primary/30 transition-colors"
                      >
                        <div className="relative h-12 w-12 flex-shrink-0 bg-primary/5 rounded-xl flex items-center justify-center overflow-hidden">
                           <img src={f.icon} alt={f.condition} className="h-10 w-10 relative z-10" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground">
                            {format(new Date(f.date), 'EEEE, MMM dd')}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg font-bold text-foreground">{f.temp}°C</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                              {f.condition}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
