import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info" | "purple" | "orange";

const variantStyles: Record<BadgeVariant, string> = {
  success: "border-foreground bg-transparent text-foreground",
  warning: "border-foreground bg-transparent text-foreground",
  danger: "border-foreground bg-transparent text-foreground",
  neutral: "border-muted-foreground bg-transparent text-muted-foreground",
  info: "border-foreground bg-transparent text-foreground",
  purple: "border-foreground bg-transparent text-foreground",
  orange: "border-foreground bg-transparent text-foreground",
};

const variantLabels: Record<BadgeVariant, string> = {
  success: "✓ ",
  warning: "⚠ ",
  danger: "✗ ",
  neutral: "○ ",
  info: "● ",
  purple: "◆ ",
  orange: "▶ ",
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
        "inline-flex items-center px-2 py-0.5 text-xs font-bold border rounded-none whitespace-nowrap font-mono",
        variantStyles[variant],
        className
      )}
    >
      {variantLabels[variant]}{children}
    </span>
  );
}
