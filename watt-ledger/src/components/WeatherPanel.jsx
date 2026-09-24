import { useEffect, useMemo, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudSun,
  Zap,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";

import {
  projectWeatherLoad,
  estimateWeatherLoss,
} from "../utils/energyData";

/* Open-Meteo is free, keyless, and CORS-enabled -- fine for a client-side
   fetch straight from the browser. WMO weather codes: https://open-meteo.com/en/docs */
function iconForCode(code) {
  if (code === 0) return Sun;
  if ([1, 2].includes(code)) return CloudSun;
  if ([3, 45, 48].includes(code)) return Cloud;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
  return CloudRain;
}

function labelForCode(code) {
  const map = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    95: "Thunderstorm",
  };
  return map[code] ?? "Mixed";
}

export default function WeatherPanel({
  facility,
  baselineKwByHour,
  wasteRatio,
  utilityRate,
}) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!facility?.lat || !facility?.lon) {
      setError("No coordinates configured for this facility.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${facility.lat}` +
          `&longitude=${facility.lon}` +
          `&hourly=temperature_2m,weather_code&temperature_unit=celsius` +
          `&forecast_days=2&timezone=auto`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Weather API returned ${res.status}`);

        const data = await res.json();

        const now = Date.now();
        const hours = data.hourly.time
          .map((t, i) => ({
            time: new Date(t),
            hourOfDay: new Date(t).getHours(),
            tempC: data.hourly.temperature_2m[i],
            code: data.hourly.weather_code[i],
          }))
          .filter((h) => h.time.getTime() >= now)
          .slice(0, 24);

        setForecast(hours);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Couldn't reach the weather service.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [facility?.lat, facility?.lon]);

  const withLoad = useMemo(() => {
    if (!forecast) return [];
    return projectWeatherLoad(baselineKwByHour, forecast);
  }, [forecast, baselineKwByHour]);

  const lossEstimate = useMemo(() => {
    if (!withLoad.length) return null;
    return estimateWeatherLoss(withLoad, wasteRatio, utilityRate);
  }, [withLoad, wasteRatio, utilityRate]);

  const current = forecast?.[0];
  const CurrentIcon = current ? iconForCode(current.code) : CloudSun;
  const peak = withLoad.length
    ? withLoad.reduce((a, b) => (b.tempC > a.tempC ? b : a))
    : null;

  return (
    <section className="p-6 space-y-6 max-w-7xl w-full mx-auto">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <CloudSun className="w-6 h-6 text-sky-400" />
          Weather & Load Forecast
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          24-hour outdoor conditions for {facility?.name ?? "this facility"}{" "}
          and the estimated HVAC load and avoidable-waste impact of that
          weather.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <RefreshCcw className="w-4 h-4 animate-spin" />
          Loading live forecast...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && current && (
        <>
          {/* CURRENT + EXPECTED LOSS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-[#101725] p-5">
              <div className="text-xs font-semibold uppercase text-slate-400">
                Current Conditions
              </div>

              <div className="mt-3 flex items-center gap-3">
                <CurrentIcon className="w-9 h-9 text-sky-400" />
                <div>
                  <div className="text-2xl font-black text-white">
                    {Math.round(current.tempC)}°C
                  </div>
                  <div className="text-xs text-slate-400">
                    {labelForCode(current.code)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-900/40 bg-[#17161b] p-5">
              <div className="text-xs font-semibold uppercase text-amber-300/80">
                Peak Forecast Temp (24h)
              </div>

              <div className="mt-3 flex items-center gap-3">
                <TrendingUp className="w-9 h-9 text-amber-400" />
                <div>
                  <div className="text-2xl font-black text-amber-400">
                    {peak ? Math.round(peak.tempC) : "--"}°C
                  </div>
                  <div className="text-xs text-slate-400">
                    {peak
                      ? peak.time.toLocaleTimeString("en-US", {
                          hour: "numeric",
                        })
                      : "--"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-rose-900/40 bg-[#1b1013] p-5">
              <div className="text-xs font-semibold uppercase text-rose-300/80">
                Expected Weather-Driven Loss (24h)
              </div>

              <div className="mt-3 flex items-center gap-3">
                <Zap className="w-9 h-9 text-rose-400" />
                <div>
                  <div className="text-2xl font-black text-rose-400">
                    ${lossEstimate?.expectedLossDollars.toLocaleString() ?? 0}
                  </div>
                  <div className="text-xs text-slate-400">
                    {lossEstimate?.expectedLossKwh.toLocaleString() ?? 0} kWh
                    modeled avoidable waste
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 -mt-2">
            Expected loss = forecasted cooling-degree load above a 21°C
            setpoint × this facility's current waste ratio ({Math.round(
              wasteRatio * 100
            )}
            %) × ${utilityRate.toFixed(2)}/kWh. Illustrative estimate, not a
            guarantee.
          </p>

          {/* 24H STRIP */}
          <div className="rounded-xl border border-slate-800 bg-[#101725] p-5 overflow-x-auto">
            <div className="text-sm font-bold text-white mb-4">
              24-Hour Outlook
            </div>

            <div className="flex gap-3 min-w-max">
              {withLoad.map((h) => {
                const Icon = iconForCode(h.code);
                return (
                  <div
                    key={h.time.toISOString()}
                    className="flex flex-col items-center gap-1.5 w-16 flex-shrink-0 rounded-lg border border-slate-800 bg-slate-900/60 p-2"
                  >
                    <span className="text-[10px] text-slate-500">
                      {h.time.toLocaleTimeString("en-US", {
                        hour: "numeric",
                      })}
                    </span>
                    <Icon className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold text-white">
                      {Math.round(h.tempC)}°
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        h.weatherAddKw > 0
                          ? "text-amber-400"
                          : "text-slate-600"
                      }`}
                    >
                      +{h.weatherAddKw}kW
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
