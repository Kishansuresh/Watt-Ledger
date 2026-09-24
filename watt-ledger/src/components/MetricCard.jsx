import { AlertTriangle } from "lucide-react";

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  variant = "default",
}) {
  const styles = {
    default: "bg-[#101725] border-slate-800",
    warning: "bg-[#17161b] border-amber-900/40",
    success: "bg-[#0f1d1f] border-emerald-900/40",
  };

  const titleStyles = {
    default: "text-slate-400",
    warning: "text-amber-300/80",
    success: "text-emerald-400/80",
  };

  const valueStyles = {
    default: "text-white",
    warning: "text-amber-400",
    success: "text-emerald-400",
  };

  return (
    <div
      className={`relative overflow-hidden border rounded-xl p-5 print:border-slate-300 ${styles[variant]}`}
    >
      {variant === "warning" && (
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <AlertTriangle className="w-16 h-16 text-amber-500" />
        </div>
      )}

      <div
        className={`text-xs font-semibold uppercase ${titleStyles[variant]}`}
      >
        {title}
      </div>

      <div
        className={`text-2xl font-black mt-1 relative z-10 ${valueStyles[variant]}`}
      >
        {value}{" "}
        {unit && (
          <span className="text-xs font-normal">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="text-[11px] mt-2 flex items-center gap-1 text-slate-400 relative z-10">
          {Icon && <Icon className="w-3 h-3 text-emerald-400" />}
          {subtitle}
        </div>
      )}
    </div>
  );
}