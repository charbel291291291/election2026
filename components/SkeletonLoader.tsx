import React from "react";
import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "card" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = "",
  variant = "rect",
  width,
  height,
  count = 1,
}) => {
  const baseClasses = "bg-slate-800/50 rounded-lg animate-pulse";

  const variantClasses = {
    text: "h-4",
    card: "h-32",
    circle: "rounded-full",
    rect: "",
  };

  const items = Array.from({ length: count }, (_, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.1 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width: width || (variant === "circle" ? height || "40px" : "100%"),
        height: height || (variant === "circle" ? width || "40px" : "20px"),
      }}
    />
  ));

  if (count === 1) {
    return items[0];
  }

  return <div className="space-y-2">{items}</div>;
};

export default SkeletonLoader;
