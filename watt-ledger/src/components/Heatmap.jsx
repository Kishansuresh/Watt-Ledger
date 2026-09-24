import {
  Map,
  Activity,
  Thermometer,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function Heatmap({ zones = [] }) {
  function calculateHealth(zone) {
    if (zone.healthScore != null) return zone.healthScore;
    const current = Number(zone.currentKw) || 0;
    const baseline = Number(zone.baselineKw) || 1;

    const excessPercent =
      ((current - baseline) / baseline) * 100;

    // 100% = operating at or below baseline
    // Health decreases as excess consumption increases.
    const health = Math.max(
      0,
      Math.min(
        100,
        Math.round(100 - excessPercent)
      )
    );

    return health;
  }

  function getHealthStatus(health) {
    if (health >= 90) {
      return {
        label: "Healthy",
        text: "text-emerald-400",
        bg: "bg-emerald-500",
        icon: CheckCircle,
      };
    }

    if (health >= 70) {
      return {
        label: "Watch",
        text: "text-amber-400",
        bg: "bg-amber-500",
        icon: Activity,
      };
    }

    return {
      label: "Critical",
      text: "text-rose-400",
      bg: "bg-rose-500",
      icon: AlertTriangle,
    };
  }

  return (
    <section className="p-6 space-y-6 max-w-7xl w-full mx-auto">

      {/* HEADER */}

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <Map className="w-6 h-6 text-emerald-400" />
          Spatial Heatmap
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Zone-level energy diagnostics showing current load,
          baseline deviation, waste, and equipment health.
        </p>
      </div>


      {/* EXPLANATION */}

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">

        <div className="flex items-start gap-3">

          <Activity className="mt-0.5 h-5 w-5 text-emerald-400" />

          <div>

            <h2 className="text-sm font-bold text-white">
              How Zone Health is calculated
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Health represents how closely the zone is operating
              to its expected baseline. Higher excess consumption
              results in a lower health score.
            </p>

          </div>

        </div>

      </div>


      {/* ZONES */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {zones.map((zone) => {

          const health = calculateHealth(zone);

          const status =
            getHealthStatus(health);

          const StatusIcon =
            status.icon;

          const current =
            Number(zone.currentKw) || 0;

          const baseline =
            Number(zone.baselineKw) || 0;

          const waste =
            Math.max(
              0,
              current - baseline
            );

          const excessPercent =
            baseline > 0
              ? Math.round(
                  ((current - baseline) /
                    baseline) *
                    100
                )
              : 0;

          return (

            <div
              key={zone.id}
              className="
                rounded-2xl
                border
                border-slate-800
                bg-[#101725]
                p-5
                shadow-xl
              "
            >

              {/* TOP */}

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-base font-bold text-white">
                    {zone.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Zone ID: {zone.id}
                  </p>

                </div>


                {/* HEALTH */}

                <div className="text-right">

                  <div
                    className={`flex items-center justify-end gap-1.5 ${status.text}`}
                  >

                    <StatusIcon className="h-4 w-4" />

                    <span className="text-2xl font-black">
                      {health}%
                    </span>

                  </div>

                  <div
                    className={`text-[10px] font-bold uppercase tracking-wide ${status.text}`}
                  >
                    {status.label}
                  </div>

                </div>

              </div>


              {/* HEALTH BAR */}

              <div className="mt-4">

                <div className="mb-1 flex justify-between text-[10px]">

                  <span className="text-slate-500">
                    Zone health
                  </span>

                  <span className={status.text}>
                    {health}%
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className={`h-full rounded-full transition-all ${status.bg}`}
                    style={{
                      width: `${health}%`,
                    }}
                  />

                </div>

              </div>


              {/* METRICS */}

              <div className="mt-5 grid grid-cols-3 gap-2">

                {/* CURRENT */}

                <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">

                  <Zap className="mb-2 h-4 w-4 text-amber-400" />

                  <p className="text-[10px] uppercase text-slate-500">
                    Current
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-white">
                    {current} kW
                  </p>

                </div>


                {/* BASELINE */}

                <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">

                  <Activity className="mb-2 h-4 w-4 text-sky-400" />

                  <p className="text-[10px] uppercase text-slate-500">
                    Baseline
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-white">
                    {baseline} kW
                  </p>

                </div>


                {/* WASTE */}

                <div className="rounded-lg border border-rose-900/50 bg-rose-950/20 p-3">

                  <Thermometer className="mb-2 h-4 w-4 text-rose-400" />

                  <p className="text-[10px] uppercase text-slate-500">
                    Excess
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-rose-400">
                    +{waste} kW
                  </p>

                </div>

              </div>


              {/* DEVIATION */}

              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">

                <span className="text-xs text-slate-400">
                  Above baseline
                </span>

                <span
                  className={`text-xs font-bold ${
                    excessPercent > 50
                      ? "text-rose-400"
                      : excessPercent > 20
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {excessPercent > 0
                    ? `+${excessPercent}%`
                    : `${excessPercent}%`}
                </span>

              </div>


              {/* ISSUE */}

              <div
                className={`mt-4 rounded-lg border p-3 ${
                  health < 70
                    ? "border-rose-900/50 bg-rose-950/20"
                    : health < 90
                    ? "border-amber-900/50 bg-amber-950/20"
                    : "border-emerald-900/50 bg-emerald-950/20"
                }`}
              >

                <p
                  className={`text-[10px] font-bold uppercase tracking-wide ${status.text}`}
                >
                  Detected condition
                </p>

                <p className="mt-1 text-sm text-slate-200">
                  {zone.issue}
                </p>

              </div>

            </div>

          );

        })}

      </div>

    </section>
  );
}