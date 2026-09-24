import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1 z-50 relative">
      <div className="font-bold text-slate-200">
        {data.timeStr}
      </div>

      <div className="flex justify-between gap-4 text-rose-400">
        <span>Actual Draw:</span>
        <span className="font-mono font-bold">
          {data.actual !== null ? data.actual : "--"} kW
        </span>
      </div>

      <div className="flex justify-between gap-4 text-slate-400">
        <span>Expected Baseline:</span>
        <span className="font-mono">
          {data.baseline} kW
        </span>
      </div>

      {data.isAnomaly && data.actual !== null && (
        <div className="mt-1 pt-1 border-t border-slate-800 text-amber-300 font-medium">
          ⚠️ {data.anomalyNote || "Unscheduled load spike"}{" "}
          (+{data.wasteKw} kW waste)
        </div>
      )}

      {data.projected !== null && data.actual === null && (
        <div className="mt-1 pt-1 border-t border-slate-800 text-emerald-400 font-medium">
          Forecasted Load: {data.projected} kW
        </div>
      )}
    </div>
  );
};

export default function LoadChart({
  timeseries = [],
  anomalyText = "None",
  sampling = "Hourly",
  zScore = "0.00",
}) {
  return (
    <div className="bg-[#101725] border border-slate-800 rounded-xl p-6 print:bg-white print:border-slate-300 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-white print:text-black">
            Interactive Load Analysis
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry showing parasitic waste gaps and Watt AI&apos;s
            24-hour forecasted load.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#f43f5e]" />
            Actual Load
          </div>

          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#94a3b8]" />
            Expected Baseline
          </div>

          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#34d399] border border-slate-900" />
            AI Forecast
          </div>
        </div>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={timeseries}
            margin={{
              top: 10,
              right: 10,
              left: -15,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="actualGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#f43f5e"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#f43f5e"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="forecastGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#34d399"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="#34d399"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />

            <XAxis
              dataKey="timeStr"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              interval={24}
            />

            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              unit=" kW"
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
            />

            <Area
              type="monotone"
              dataKey="actual"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#actualGradient)"
            />

            <Area
              type="monotone"
              dataKey="projected"
              stroke="#34d399"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#forecastGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-1 rounded bg-[#f43f5e]" />
            Actual Load (kW)
          </span>

          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 border-t border-dashed border-slate-400" />
            Baseline (kW)
          </span>

          <span className="text-amber-300">
            ● Anomalies Flagged: {anomalyText}
          </span>
        </div>

        <span className="font-mono text-slate-500">
          Sampling: {sampling} Telemetry | Residual Z-Score: {zScore}σ
        </span>
      </div>
    </div>
  );
}