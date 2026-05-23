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
        glow && "ring-1 ring-emerald-500/25 shadow-[0_0_40px_-12px_rgba(16,185,129,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
