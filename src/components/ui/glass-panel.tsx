import { cn } from "@/lib/utils";

type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
};

export function GlassPanel({ children, className, glow = false }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_20px_70px_-35px_rgba(15,23,42,0.9)] backdrop-blur-xl",
        glow && "ring-1 ring-blue-400/20",
        className,
      )}
    >
      {children}
    </div>
  );
}
