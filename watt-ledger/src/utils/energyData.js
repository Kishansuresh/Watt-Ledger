export function generateFacilityTimeseries(scenario, predictFuture = false) {
  const points = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);

  const totalHours = predictFuture ? 192 : 168;

  for (let i = 0; i < totalHours; i++) {
    const timestamp = new Date(now.getTime() - (168 - 1 - i) * 3600 * 1000);
    const dayOfWeek = timestamp.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const hour = timestamp.getHours();
    const isFuture = i >= 168;

    let baseLoad = 85;
    let daytimeBoost = 0;

    if (!isWeekend && hour >= 7 && hour <= 19) {
      daytimeBoost = Math.sin(((hour - 7) / 12) * Math.PI) * 190;
    } else if (isWeekend && hour >= 9 && hour <= 17) {
      daytimeBoost = Math.sin(((hour - 9) / 8) * Math.PI) * 45;
    }

    const baseline = Math.round(baseLoad + daytimeBoost + (Math.random() * 8 - 4));
    let actual = baseline + Math.round(Math.random() * 10 - 5);

    let isAnomaly = false;
    let anomalyNote = null;

    if (!isFuture) {
      // Fix: Rely purely on the 24-hour clock so anomalies trigger regardless of local time offsets
      if (hour >= 23 || hour <= 4) {
        actual += 165 + Math.round(Math.random() * 30);
        isAnomaly = true;

        if (hour === 2) {
          if (scenario === "tower_a") anomalyNote = "Night-time VAV schedule miss";
          else if (scenario === "retail_mall") anomalyNote = "Food Court MAU failed ON";
          else if (scenario === "corporate_hq") anomalyNote = "Server Room CRAC short-cycling";
          else anomalyNote = "Night setback ignored";
        }
      }
    } else {
      actual = null;
    }

    const wasteKw = isAnomaly && !isFuture ? Math.max(0, actual - baseline) : 0;

    points.push({
      id: i,
      rawDate: timestamp,
      timeStr: timestamp.toLocaleDateString("en-US", { weekday: "short" }) + " " + timestamp.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
      hourOfDay: hour,
      baseline,
      actual: isFuture ? null : Math.max(0, actual),
      projected: isFuture ? Math.round(baseline * 1.05) : null,
      wasteKw,
      isAnomaly,
      anomalyNote,
    });
  }

  return points;
}

export function playAlertTone(type = "alarm") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "alarm") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    }
  } catch (err) {
    console.warn("Audio interaction blocked by browser policy.");
  }
}

function fmtTime(d) {
  return (
    d.toLocaleDateString("en-US", { weekday: "short" }) + " " +
    d.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
  );
}

export function parseMeterCsv(text) {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((r) => r.split(",").map((c) => c.trim()));

  const hasHeader = isNaN(parseFloat(rows[0][1]));
  const head = rows[0].map((h) => h.toLowerCase());
  const ti = hasHeader ? Math.max(0, head.findIndex((h) => /time|date/.test(h))) : 0;
  let ki = hasHeader ? head.findIndex((h) => /kw|load|power|demand/.test(h)) : 1;
  if (ki < 0) ki = ti === 0 ? 1 : 0;

  const parsed = rows
    .slice(hasHeader ? 1 : 0)
    .map((r) => ({ d: new Date(r[ti]), kw: parseFloat(r[ki]) }))
    .filter((p) => !isNaN(p.d) && !isNaN(p.kw))
    .sort((a, b) => a.d - b.d);

  if (parsed.length < 24) {
    throw new Error("need at least 24 rows of timestamp,kW");
  }

  const key = (d) => `\({d.getDay() === 0 || d.getDay() === 6 ? "we" : "wd"}-\){d.getHours()}`;
  
  const groups = {};
  parsed.forEach((p) => {
    (groups[key(p.d)] ||= []).push(p.kw);
  });
  const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

  let prevAnomaly = false;
  return parsed.map((p, i) => {
    const baseline = Math.round(median(groups[key(p.d)]));
    const excess = p.kw - baseline;
    const isAnomaly = excess > Math.max(20, baseline * 0.25);
    const point = {
      id: i,
      rawDate: p.d,
      timeStr: fmtTime(p.d),
      hourOfDay: p.d.getHours(),
      baseline,
      actual: Math.round(p.kw),
      projected: null,
      wasteKw: isAnomaly ? Math.round(excess) : 0,
      isAnomaly,
      anomalyNote: isAnomaly && !prevAnomaly ? "Load excursion above baseline" : null,
    };
    prevAnomaly = isAnomaly;
    return point;
  });
}

export function samplingLabel(data) {
  if (data.length < 2) return "Hourly";
  const min = Math.round((data[1].rawDate - data[0].rawDate) / 60000);
  return min === 60 ? "Hourly" : `${min}-min`;
}

export function residualZScore(data) {
  const r = data.filter((p) => p.actual !== null).map((p) => p.actual - p.baseline);
  if (r.length < 2) return "0.00";
  const mean = r.reduce((a, b) => a + b, 0) / r.length;
  const sd = Math.sqrt(r.reduce((a, b) => a + (b - mean) ** 2, 0) / r.length) || 1;
  return (Math.max(...r.map((x) => Math.abs(x - mean))) / sd).toFixed(2);
}

export function projectWeatherLoad(baselineKwByHour, forecastHours, opts = {}) {
  const setpointC = opts.setpointC ?? 21;
  const kwPerDegree = opts.kwPerDegree ?? 4.5; 

  return forecastHours.map((h) => {
    const degreesOver = Math.max(0, h.tempC - setpointC);
    const weatherAddKw = Math.round(degreesOver * kwPerDegree);
    const base = baselineKwByHour[h.hourOfDay] ?? 120;
    return {
      ...h,
      baselineKw: base,
      weatherAddKw,
      projectedKw: base + weatherAddKw,
    };
  });
}

export function estimateWeatherLoss(forecastWithLoad, currentWasteRatio, utilityRate) {
  const totalWeatherKwh = forecastWithLoad.reduce(
    (sum, h) => sum + h.weatherAddKw,
    0
  );
  const expectedLossKwh = Math.round(totalWeatherKwh * currentWasteRatio);
  return {
    totalWeatherKwh,
    expectedLossKwh,
    expectedLossDollars: Math.round(expectedLossKwh * utilityRate),
  };
}