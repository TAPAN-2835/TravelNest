import { 
  Bell, MapPin, Calendar, Cloud, Thermometer, Loader2, CloudSun, 
  Wind, Droplets, Umbrella, Baby, Newspaper, ExternalLink, RefreshCw, 
  ChevronRight, Info, AlertTriangle, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { alertsApi, WeatherAlert, NewsItem } from "../../api/alerts";
import { format } from "date-fns";
import { WeatherBackground } from "./WeatherBackground";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

const getRealisticIcon = (code: string) => {
  const mapping: Record<string, string> = {
    '01d': 'clear-day',
    '01n': 'clear-night',
    '02d': 'partly-cloudy-day',
    '02n': 'partly-cloudy-night',
    '03d': 'cloudy',
    '03n': 'cloudy',
    '04d': 'overcast-day',
    '04n': 'overcast-night',
    '09d': 'rain',
    '09n': 'rain',
    '10d': 'partly-cloudy-day-rain',
    '10n': 'partly-cloudy-night-rain',
    '11d': 'thunderstorms-day',
    '11n': 'thunderstorms-night',
    '13d': 'snow',
    '13n': 'snow',
    '50d': 'mist',
    '50n': 'mist',
  };
  const iconName = mapping[code] || 'clear-day';
  // Using jsDelivr for faster and more reliable delivery of GitHub-hosted SVGs
  return `https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/${iconName}.svg`;
};

export default function Alerts() {
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab ] = useState<"weather" | "news">("weather");
  const [weatherMode, setWeatherMode] = useState<"day" | "night">("day");

  const fetchAlerts = async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const response = await alertsApi.getWeatherAlerts();
      if (response.success) {
        setWeatherAlerts(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch smart alerts:", err);
      setError("Could not load travel intelligence. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-muted-foreground">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
          <motion.div 
            className="absolute inset-0 bg-primary/10 blur-xl rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <p className="text-lg font-semibold text-foreground animate-pulse">Syncing Travel Intelligence...</p>
        <p className="text-sm mt-2 opacity-70">Fetching real-time weather, news, and family tips</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 px-4">
      {/* Header Section */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
               <Bell className="h-6 w-6 text-primary" />
             </div>
             <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Travel Feed</h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            Real-time intelligence for your upcoming trips. Enriched for family planning.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 items-end">
          <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
            <Button 
              variant={activeTab === "weather" ? "default" : "ghost"} 
              size="sm" 
              className="rounded-xl px-4"
              onClick={() => setActiveTab("weather")}
            >
              Weather & Tips
            </Button>
            <Button 
              variant={activeTab === "news" ? "default" : "ghost"} 
              size="sm" 
              className="rounded-xl px-4"
              onClick={() => setActiveTab("news")}
            >
              Local News
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl ml-1"
              onClick={() => fetchAlerts(true)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <AnimatePresence>
            {activeTab === "weather" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-1 bg-background border border-border p-1 rounded-xl shadow-sm"
              >
                <Button
                  variant={weatherMode === "day" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setWeatherMode("day")}
                  className="rounded-lg h-8 px-3 text-[11px] font-bold gap-2"
                >
                  <CloudSun className="h-3.5 w-3.5 text-orange-500" /> Day
                </Button>
                <Button
                  variant={weatherMode === "night" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setWeatherMode("night")}
                  className="rounded-lg h-8 px-3 text-[11px] font-bold gap-2"
                >
                  <Thermometer className="h-3.5 w-3.5 text-indigo-500" /> Night
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl border border-destructive/20 bg-destructive/5 text-center space-y-4"
          >
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-destructive font-bold">{error}</p>
            <Button variant="outline" onClick={() => fetchAlerts(true)}>Retry Connection</Button>
          </motion.div>
        ) : weatherAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 rounded-[2.5rem] border border-dashed border-border flex flex-col items-center justify-center text-center bg-muted/30 relative overflow-hidden"
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full max-w-lg bg-primary/5 blur-[100px] -z-10" />
            <div className="h-24 w-24 bg-background rounded-3xl shadow-2xl flex items-center justify-center mb-8 rotate-3">
              <CloudSun className="h-12 w-12 text-primary/60" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">All Clear for Now!</h3>
            <p className="text-muted-foreground mt-3 max-w-sm text-lg leading-relaxed">
              No active alerts for your upcoming trips. Start planning your next adventure to see more!
            </p>
            <Button variant="outline" className="mt-8 rounded-2xl px-8 h-12 text-lg border-primary/20 hover:bg-primary/5">
              Plan New Trip
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-10">
            {weatherAlerts.map((alert, tripIdx) => (
              <motion.div
                key={alert.tripId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tripIdx * 0.15 }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                {/* Visual Context Layer */}
                <WeatherBackground condition={alert.forecast?.[0]?.condition || "Clear"} />

                <div className="p-8 lg:p-10 relative z-10">
                  {/* Trip Header Card */}
                  <div className="flex flex-wrap items-start justify-between gap-6 mb-10 pb-8 border-b border-border/50">
                    <div className="space-y-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">
                        Upcoming Trip Alert
                      </Badge>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">Destination</span>
                        </div>
                        <h3 className="text-4xl font-black text-foreground tracking-tight underline decoration-primary/30 decoration-4 underline-offset-8">
                          {alert.destination}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 rounded-3xl bg-background/60 border border-border/50 flex items-center gap-4 shadow-sm">
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground font-bold tracking-wide uppercase">Journey Dates</p>
                        <p className="font-bold text-lg text-foreground mt-0.5">
                          {format(new Date(alert.startDate), 'dd MMM')} – {format(new Date(alert.endDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {activeTab === "weather" ? (
                    <div className="space-y-8">
                      {/* Enriched Weather Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(weatherMode === "day" ? alert.dayForecast : alert.nightForecast).map((f, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className={`p-6 rounded-[2rem] border transition-all shadow-sm flex flex-col gap-6 ${
                              weatherMode === "night" 
                                ? "bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-2xl" 
                                : "bg-background/80 border-border hover:border-primary/40 text-foreground"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-bold ${weatherMode === "night" ? "text-zinc-400" : "text-muted-foreground"}`}>
                                {format(new Date(f.date), 'EEEE, MMM dd')}
                              </p>
                              <Badge 
                                variant="secondary" 
                                className={`text-[10px] border-none ${
                                  weatherMode === "night" ? "bg-zinc-800 text-zinc-300" : "bg-secondary/50"
                                }`}
                              >
                                {f.condition}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className={`relative h-20 w-20 rounded-3xl flex items-center justify-center overflow-hidden border transition-colors shadow-inner ${
                                weatherMode === "night" 
                                  ? "bg-zinc-950 border-zinc-800 group-hover:bg-zinc-900" 
                                  : "bg-primary/5 border-primary/10 group-hover:bg-primary/10"
                              }`}>
                                <img 
                                  src={getRealisticIcon(f.iconCode)} 
                                  alt={f.condition} 
                                  className="h-16 w-16 relative z-10 drop-shadow-md" 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = f.icon;
                                  }}
                                />
                                <div className={`absolute inset-0 pointer-events-none ${
                                  weatherMode === "night" ? "bg-gradient-to-br from-white/5 to-transparent" : "bg-gradient-to-br from-white/20 to-transparent"
                                }`} />
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-4xl font-black leading-none ${weatherMode === "night" ? "text-white" : "text-foreground"}`}>
                                  {f.temp}°C
                                </span>
                                <span className={`text-xs font-medium mt-1 ${weatherMode === "night" ? "text-zinc-500" : "text-muted-foreground"}`}>
                                  Feels like {f.feelsLike}°C
                                </span>
                              </div>
                            </div>

                            <div className={`grid grid-cols-3 gap-2 pt-4 border-t ${
                              weatherMode === "night" ? "border-zinc-800" : "border-border/50"
                            }`}>
                              <div className="flex flex-col items-center gap-1">
                                <Droplets className="h-4 w-4 text-blue-500" />
                                <span className="text-[11px] font-bold">{f.humidity}%</span>
                                <span className={`text-[9px] uppercase opacity-70 ${weatherMode === "night" ? "text-zinc-500" : "text-muted-foreground"}`}>
                                  Humidity
                                </span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <Wind className="h-4 w-4 text-emerald-500" />
                                <span className="text-[11px] font-bold">{f.windSpeed}m/s</span>
                                <span className={`text-[9px] uppercase opacity-70 ${weatherMode === "night" ? "text-zinc-500" : "text-muted-foreground"}`}>
                                  Wind
                                </span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <Umbrella className="h-4 w-4 text-indigo-500" />
                                <span className="text-[11px] font-bold">{f.pop}%</span>
                                <span className={`text-[9px] uppercase opacity-70 ${weatherMode === "night" ? "text-zinc-500" : "text-muted-foreground"}`}>
                                  Rain
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Family Planning Insight Section */}
                      {alert.familyTip && (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6"
                        >
                          <div className="h-14 w-14 bg-primary/10 rounded-2xl flex flex-shrink-0 items-center justify-center">
                            <Baby className="h-8 w-8 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                              Family Planning Insight
                              <Badge className="bg-primary text-primary-foreground text-[9px] h-4">AI Enhanced</Badge>
                            </h4>
                            <p className="text-muted-foreground leading-relaxed italic">
                              "{alert.familyTip}"
                            </p>
                          </div>
                          <div className="ml-auto">
                            <Button variant="ghost" size="sm" className="text-primary gap-2 font-bold whitespace-nowrap">
                              Plan Details <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    /* Local News & Events Section */
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Newspaper className="h-5 w-5 text-primary" />
                        <h4 className="text-xl font-bold">Local Buzz in {alert.destination}</h4>
                      </div>
                      <div className="grid gap-4">
                        {alert.news && alert.news.length > 0 ? (
                          alert.news.map((item, i) => (
                            <motion.a
                              key={i}
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ x: 4 }}
                              className="group/news p-5 rounded-2xl bg-background/40 hover:bg-background/80 border border-border/50 hover:border-primary/20 transition-all flex gap-6"
                            >
                              {item.imageUrl && (
                                <div className="h-24 w-32 flex-shrink-0 rounded-xl overflow-hidden hidden sm:block">
                                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover/news:scale-110" />
                                </div>
                              )}
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold text-primary uppercase">{item.source}</span>
                                  <span className="text-[10px] text-muted-foreground font-medium">{item.date}</span>
                                </div>
                                <h5 className="font-bold text-foreground line-clamp-2 group-hover/news:text-primary transition-colors">
                                  {item.title}
                                </h5>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {item.snippet}
                                </p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover/news:text-primary transition-colors mt-1" />
                            </motion.a>
                          ))
                        ) : (
                          <div className="p-10 text-center rounded-2xl border border-dashed border-border bg-muted/20">
                            <p className="text-muted-foreground italic">No trending local alerts for this specific window.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
