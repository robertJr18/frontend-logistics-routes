import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info" | "purple" | "orange";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-success text-success-foreground",
  warning: "bg-accent text-accent-foreground",
  danger: "bg-destructive text-destructive-foreground",
  neutral: "bg-muted text-muted-foreground",
  info: "bg-primary text-primary-foreground",
  purple: "bg-[hsl(270,60%,50%)] text-white",
  orange: "bg-accent text-accent-foreground",
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
