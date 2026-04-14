import React from "react";
import { motion } from "framer-motion";

interface WeatherBackgroundProps {
  condition: string;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition }) => {
  const normalizedCondition = condition.toLowerCase();

  const renderClouds = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/60 blur-3xl"
          style={{
            width: Math.random() * 300 + 200,
            height: Math.random() * 150 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 100, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );

  const renderHeatWaves = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 bg-gradient-to-tr from-orange-500/10 to-transparent">
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          filter: "blur(40px)",
          background: "radial-gradient(circle, rgba(251,146,60,0.2) 0%, transparent 70%)",
        }}
      />
    </div>
  );

  const renderRainGlow = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        style={{
          background: "linear-gradient(180deg, rgba(59,130,246,0.1) 0%, transparent 100%)",
        }}
      />
    </div>
  );

  if (normalizedCondition.includes("cloud") || normalizedCondition.includes("mist")) {
    return renderClouds();
  }
  if (normalizedCondition.includes("heat") || normalizedCondition.includes("clear") || normalizedCondition.includes("sun")) {
    return renderHeatWaves();
  }
  if (normalizedCondition.includes("rain") || normalizedCondition.includes("drizzle") || normalizedCondition.includes("thunder")) {
    return renderRainGlow();
  }

  return null;
};
