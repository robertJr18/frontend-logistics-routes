import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: "w-7 h-7", box: "w-9 h-9", text: "text-lg" },
  md: { icon: "w-8 h-8", box: "w-11 h-11", text: "text-2xl" },
  lg: { icon: "w-10 h-10", box: "w-14 h-14", text: "text-3xl" },
};

export default function BrandLogo({ size = "md", className }: BrandLogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] shadow-lg shadow-primary/30", s.box)}>
        <Truck className={cn("text-[hsl(var(--primary-foreground))]", s.icon)} strokeWidth={2.5} />
      </div>
      <div className={cn("font-bold tracking-tight", s.text)}>
        <span className="text-white">Logistics</span>
        <span className="gradient-primary-text">Routes</span>
      </div>
    </div>
  );
}
