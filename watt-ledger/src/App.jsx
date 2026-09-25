import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./utils/supabaseClient";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoadChart from "./components/LoadChart";
import Heatmap from "./components/Heatmap";
import WasteFeed from "./components/WasteFeed";
import Leaderboard from "./components/Leaderboard";
import Simulator from "./components/Simulator";
import WeatherPanel from "./components/WeatherPanel";
import AIChat from "./components/AIChat";
import ReportModal from "./components/ReportModal";
import MetricCard from "./components/MetricCard";

import ActionableROI from "./components/ActionableROI";
import Scorecard from "./components/Scorecard";
import Sandbox from "./components/Sandbox";

import {
  generateFacilityTimeseries,
  parseMeterCsv,
  playAlertTone,
  samplingLabel,
  residualZScore,
} from "./utils/energyData";

// Moved directly into App.jsx to prevent missing file crashes
export const FACILITY_OPTIONS = [
  { id: "tower_a", name: "Metro Tower A (Commercial Office)", grossSqFt: 280000, lat: 40.7128, lon: -74.0060 },
  { id: "retail_mall", name: "Retail Mall Zone 3 (Shopping Center)", grossSqFt: 420000, lat: 34.0522, lon: -118.2437 },
  { id: "corporate_hq", name: "Corporate HQ Tech Campus", grossSqFt: 350000, lat: 41.8781, lon: -87.6298 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [facility, setFacility] = useState("tower_a");
  const [utilityRate, setUtilityRate] = useState(8.50); 
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [csvSourceName, setCsvSourceName] = useState(null);
  const [csvError, setCsvError] = useState(null);

  const [timeseries, setTimeseries] = useState([]);
  const [zones, setZones] = useState([]);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [anomaliesList, setAnomaliesList] = useState([]);

  const [toastMessage, setToastMessage] = useState(null);
  const [isGeneratingAudit, setIsGeneratingAudit] = useState(false);
  const [aiReportContent, setAiReportContent] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [dashboardPrompt, setDashboardPrompt] = useState("");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "EcoAudit AI diagnostics online. Off-hours HVAC leak detected on Floor 4. Need me to calculate the VFD retrofit payback?",
    },
  ]);

  const chatEndRef = useRef(null);

  /* =========================================================
     SUPABASE FETCH & DATA GENERATION
  ========================================================= */
  useEffect(() => {
    async function fetchFacilityData() {
      setIsDbLoading(true);

      const { data: activeZones, error } = await supabase
        .from('zones')
        .select('*')
        .eq('facility_id', facility);

      if (error) {
        console.error("Error fetching live zones:", error);
      } else if (activeZones) {
        setZones(activeZones);
      }

      if (!csvSourceName) {
        const data = generateFacilityTimeseries(facility, true);
        setTimeseries(data);
      }

      setIsDbLoading(false);
    }

    fetchFacilityData();
  }, [facility, csvSourceName]);

  useEffect(() => {
    if (!timeseries || timeseries.length === 0) return;
    
    const identified = [];
    let idCounter = 1;

    const dynamicContext = {
      tower_a: { loc: "Floor 4 AHU-2" },
      retail_mall: { loc: "Food Court RTU" },
      corporate_hq: { loc: "Server Room CRAC-1" }
    };
    
    const mappedLoc = dynamicContext[facility]?.loc || "Central Plant";

    timeseries.forEach((point) => {
      if (point.isAnomaly && point.anomalyNote) {
        const isSimulated = point.anomalyNote === "Live Simulated Peak Chiller Excursion";
        
        identified.push({
          id: `ANOM-${idCounter++}`,
          timestamp: point.timeStr,
          description: point.anomalyNote,
          location: isSimulated ? "Central Plant" : mappedLoc,
          severity: point.wasteKw > 120 ? "Critical" : "Moderate",
          wasteKw: point.wasteKw,
          impactHr: `₹${(point.wasteKw * utilityRate).toFixed(2)} /hr`,
          status: "Active",
        });
      }
    });

    setAnomaliesList(identified.reverse().slice(0, 10));
  }, [timeseries, facility, utilityRate]); 

  /* =========================================================
     UTILITY EFFECTS
  ========================================================= */
  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatOpen]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  function showToast(message, playSound = false) {
    setToastMessage(message);
    if (playSound && soundEnabled) playAlertTone("beep");
  }

  function handleCsvUpload(file) {
    if (!file) return;
    setCsvError(null);
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = parseMeterCsv(String(reader.result));
        setTimeseries(parsed);
        setCsvSourceName(file.name);
        showToast(`Loaded ${parsed.length} readings from ${file.name}`, true);
      } catch (err) {
        setCsvError(err.message || "Couldn't parse that file. Expect columns: timestamp, kW.");
        showToast("CSV import failed — check file format");
      }
    };
    reader.onerror = () => setCsvError("Couldn't read that file.");
    reader.readAsText(file);
  }

  /* =========================================================
     METRICS & WEATHER MODELS
  ========================================================= */
  const metrics = useMemo(() => {
    let totalActualKwh = 0, totalBaselineKwh = 0, totalWasteKwh = 0;

    timeseries.forEach((point) => {
      if (point.actual !== null) {
        totalActualKwh += point.actual;
        totalBaselineKwh += point.baseline;
        if (point.isAnomaly) totalWasteKwh += point.wasteKw;
      }
    });

    return {
      totalKwh: totalActualKwh,
      wasteKwh: totalWasteKwh,
      avoidableCost: Math.round(totalWasteKwh * utilityRate),
      avoidableCo2Tons: ((totalWasteKwh * 0.85) / 2204.62).toFixed(1),
      annualSavingsEst: Math.round(totalWasteKwh * utilityRate * 52),
      pctOverBaseline: totalBaselineKwh ? Math.round(((totalActualKwh - totalBaselineKwh) / totalBaselineKwh) * 100) : 0,
    };
  }, [timeseries, utilityRate]);

  const baselineKwByHour = useMemo(() => {
    const sums = {};
    const counts = {};
    timeseries.forEach((point) => {
      if (point.actual === null) return;
      sums[point.hourOfDay] = (sums[point.hourOfDay] || 0) + point.baseline;
      counts[point.hourOfDay] = (counts[point.hourOfDay] || 0) + 1;
    });
    const result = {};
    Object.keys(sums).forEach((hour) => {
      result[hour] = Math.round(sums[hour] / counts[hour]);
    });
    return result;
  }, [timeseries]);

  const wasteRatio = useMemo(() => {
    if (!metrics.totalKwh) return 0;
    return Math.min(1, metrics.wasteKwh / metrics.totalKwh);
  }, [metrics]);

  const chartFooterStats = useMemo(() => {
    const notes = [...new Set(timeseries.filter((p) => p.isAnomaly && p.anomalyNote).map((p) => p.anomalyNote))];
    return {
      anomalyText: notes.length ? notes.join(" + ") : "None detected",
      sampling: samplingLabel(timeseries),
      zScore: residualZScore(timeseries),
    };
  }, [timeseries]);

  /* =========================================================
     ACTIONS & AI CHAT
  ========================================================= */
  function handleInjectAnomaly() {
    if (soundEnabled) playAlertTone("alarm");
    setTimeseries((previous) => {
      const copy = [...previous];
      const startIndex = 168 - 6;
      for (let i = startIndex; i < 168; i++) {
        copy[i] = { ...copy[i], actual: copy[i].baseline + 280, wasteKw: 280, isAnomaly: true, anomalyNote: "Live Simulated Peak Chiller Excursion" };
      }
      return copy;
    });
    showToast("🚨 CRITICAL LOAD SURGE DETECTED (+280 kW)");
  }

  function handleGenerateAudit() {
    if (isGeneratingAudit) return;
    setIsGeneratingAudit(true);
    showToast("Generating Executive Energy Audit...", true);

    setTimeout(() => {
      const facilityName = FACILITY_OPTIONS.find((item) => item.id === facility)?.name;
      const report = `# EXECUTIVE ENERGY AUDIT\n\n**Audited Facility:** ${facilityName}\n**Date:** ${new Date().toLocaleDateString()}\n**Grid Tariff:** ₹${utilityRate.toFixed(2)} /kWh\n\n**Detected Waste:** ${metrics.wasteKwh.toLocaleString("en-IN")} kWh\n**Avoidable Utility Cost:** ₹${metrics.avoidableCost.toLocaleString("en-IN")}\n**Estimated Avoidable CO2:** ${metrics.avoidableCo2Tons} tons\n**Potential Annual Savings:** ₹${metrics.annualSavingsEst.toLocaleString("en-IN")}\n\n### 1. Executive Summary\nEcoAudit AI detected ${metrics.wasteKwh.toLocaleString("en-IN")} kWh of anomalous energy consumption.\n\n### 2. Priority Actions\n1. Adjust HVAC night setback schedules.\n2. Inspect Floor 4 AHU-2 VAV dampers.\n3. Tune VAV cooling and reheat deadbands.\n4. Investigate the Central Chiller Plant delta-T issue.\n5. Review recurring off-hours HVAC operation.\n\nGenerated by Gemini Commissioning Copilot.`;
      
      setAiReportContent(report);
      setShowReportModal(true);
      setIsGeneratingAudit(false);
      showToast("PDF Dossier generated", true);
    }, 1500);
  }

  function handleSendMessage(customPrompt) {
    const message = customPrompt || chatInput;
    if (!message.trim() || isThinking) return;

    setChatMessages((previous) => [...previous, { id: Date.now(), sender: "user", text: message }]);
    setChatInput("");
    setDashboardPrompt(""); 
    setIsThinking(true);

    setTimeout(() => {
      const lower = message.toLowerCase();
      let reply = "";

      const equipmentList = ["Floor 4 AHU-2", "Central Plant Chiller-1", "Rooftop RTU-4", "Zone 3 VAV-304", "Condenser Water Pump B"];
      
      // PERFECTLY ALIGNED ARRAYS: Index 0 Diagnosis matches Index 0 Resolution Protocol
      const diagnosticsList = [
        "BAS static pressure commanding 0.0 in. w.g., but flow sensor reports 2,400 CFM. Actuator damper stuck open.",
        "Zone temperature sensor offline, causing system to default to 100% fail-safe cooling.",
        "Manual occupancy override was triggered and never cleared by the weekend staff.",
        "Variable frequency drive (VFD) hunting rapidly between 45Hz and 60Hz due to poor PID tuning.",
        "Chilled water valve failed open, causing severe space overcooling and wasted pump energy."
      ];
      
      const actionItems = [
        "1. Dispatch technician to inspect damper physical linkage.\n2. Clear obstruction and recalibrate actuator stroke.\n3. Verify CFM drops to 0 when commanded.",
        "1. Dispatch technician to replace faulty zone thermistor.\n2. Verify controller receives accurate resistance reading.\n3. Release fail-safe mode in BAS.",
        "1. Access the BAS scheduling module.\n2. Identify the active manual override flag for this zone.\n3. Release the override and restore dynamic night setback.",
        "1. Access VFD parameter settings.\n2. Tune the PID loop proportional/integral bands to stabilize modulation.\n3. Monitor for 15 minutes to ensure hunting ceases.",
        "1. Dispatch technician to manually stroke the chilled water valve actuator.\n2. If actuator motor is burnt, replace unit.\n3. Verify space temperature recovers to target deadband."
      ];

      const randomIdx = Math.floor(Math.random() * equipmentList.length);
      const activeEquip = equipmentList[randomIdx];
      const activeDiag = diagnosticsList[randomIdx];
      const activeAction = actionItems[randomIdx];

      if (lower.includes("investigate anomaly")) {
        const timeMatch = message.match(/at\s+([^.]+)\./i);
        const severityMatch = message.match(/severity:\s*([^.]+)\./i);
        const impactMatch = message.match(/impact:\s*(.+)$/i);
        const locMatch = message.match(/anomaly on\s+(.*?):/i);
        
        const time = timeMatch ? timeMatch[1].trim() : "Unscheduled interval";
        const severity = severityMatch ? severityMatch[1].trim() : "Critical";
        const impact = impactMatch ? impactMatch[1].trim() : "₹225.00 /hr";
        const contextEquip = locMatch ? locMatch[1].trim() : activeEquip;

        const hourlyRate = parseFloat(impact.replace(/[^0-9.]/g, "")) || 225.0;
        const variance = (Math.random() * 0.2) + 0.9; 
        const monthlyProjection = Math.round(hourlyRate * 4 * 4.3 * variance); 
        
        // UPDATED AI TEMPLATE
        reply = `Telemetry Investigation [${time}] — Status: ${severity}\n\n• Target Equipment: ${contextEquip}\n• Financial Run-Rate: At ${impact}, recurring off-cycle operation costs an estimated ₹${monthlyProjection.toLocaleString("en-IN")}/month.\n• Anomaly Diagnostics: ${activeDiag}\n\n🛠️ Recommended Resolution Protocol:\n${activeAction}`;
      } 
      else if (lower.includes("payback") || lower.includes("vfd")) {
        const projName = lower.replace(/calculate payback for/i, "").trim() || "VFD Retrofit";
        const annualWaste = metrics.annualSavingsEst || 1060000;
        const retrofitCost = Math.floor(Math.random() * (350000 - 220000 + 1)) + 220000; 
        const paybackMonths = ((retrofitCost / annualWaste) * 12).toFixed(1);
        reply = `${projName} Payback Analysis:\n\n• Estimated Retrofit Quote: ₹${retrofitCost.toLocaleString("en-IN")} (Hardware + labor)\n• Current Annual Waste: ₹${annualWaste.toLocaleString("en-IN")} at ₹${utilityRate.toFixed(2)}/kWh\n• Calculated Simple Payback: ${paybackMonths} months\n• Return on Investment: Recommended.`;
      } 
      else if (lower.includes("email") || lower.includes("tenant") || lower.includes("setback")) {
        reply = `Subject: Urgent: Off-Hours HVAC Consumption Review\n\nDear Facilities Liaison,\n\nEcoAudit AI telemetry has identified recurring off-hours HVAC load cycles in your zone, generating ${metrics.wasteKwh.toLocaleString("en-IN")} kWh of avoidable consumption (₹${metrics.avoidableCost.toLocaleString("en-IN")} unbudgeted impact).\n\nPlease verify that local override thermostats are reset at the end of business days.\n\nThank you,\nFacility Management`;
      } 
      else if (lower.includes("spike") || lower.includes("highest") || lower.includes("peak")) {
        reply = `Peak Telemetry Analysis:\n\nThe single highest load surge observed across all zones reached +280 kW above baseline on the central plant loop. The secondary excursion is ${activeEquip} regularly pulling anomalous baseload during unoccupied hours.`;
      } 
      else if (lower.includes("chiller")) {
        const deltaT = (Math.random() * (7.5 - 5.0) + 5.0).toFixed(1);
        reply = `Central Chiller Plant Telemetry:\n\n• Measured Load: 245 kW (Baseline: 160 kW)\n• Excess Power Draw: +85 kW\n• Diagnosis: Low Delta-T syndrome detected (ΔT = ${deltaT}°F vs 12.0°F design specification). Primary pump cycling rapidly due to bypass valve hunting.\n\n🛠️ Recommended Resolution Protocol:\n1. Override bypass valve to 0% manually.\n2. Observe pump VFD Hz response.\n3. If valve fails to close, replace actuator.`;
      } 
      else if (lower.includes("waste") || lower.includes("baseline") || lower.includes("kwh")) {
        reply = `Facility Energy Summary:\n\n• Total Detected Waste: ${metrics.wasteKwh.toLocaleString("en-IN")} kWh (+${metrics.pctOverBaseline}% over baseline)\n• Avoidable Cost Impact: ₹${metrics.avoidableCost.toLocaleString("en-IN")}\n• Carbon Footprint: ${metrics.avoidableCo2Tons} tons CO₂e\n• Primary Culprit: ${activeEquip} failure.`;
      } 
      else {
        reply = `Gemini Commissioning Copilot ready. Telemetry sync active for ${FACILITY_OPTIONS.find((item) => item.id === facility)?.name}. Ask about equipment status, diagnose simultaneous heating/cooling, or request a retrofit payback calculation.`;
      }

      setChatMessages((previous) => [...previous, { id: Date.now() + 1, sender: "ai", text: reply }]);
      setIsThinking(false);
    }, 800);
  }

  function handleDashboardChatLaunch() {
    if(dashboardPrompt.trim()) {
      setChatOpen(true);
      handleSendMessage(dashboardPrompt);
    } else {
      setChatOpen(true);
    }
  }

  const currentFacility = FACILITY_OPTIONS.find((item) => item.id === facility);

  return (
    <div className="flex h-screen w-full bg-[#0b0f17] text-slate-100 overflow-hidden font-sans">
      
      <style>{`
        .overflow-y-auto::-webkit-scrollbar, .overflow-x-auto::-webkit-scrollbar { width: 6px; height: 6px; }
        .overflow-y-auto::-webkit-scrollbar-track, .overflow-x-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb, .overflow-x-auto::-webkit-scrollbar-thumb { background-color: #1e293b; border-radius: 10px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover, .overflow-x-auto::-webkit-scrollbar-thumb:hover { background-color: #334155; }
        .overflow-y-auto, .overflow-x-auto { scrollbar-width: thin; scrollbar-color: #1e293b transparent; }
      `}</style>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        facility={facility}
        setFacility={setFacility}
        facilityOptions={FACILITY_OPTIONS}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        utilityRate={utilityRate}
        setUtilityRate={setUtilityRate}
        onUploadCsv={handleCsvUpload}
        csvSourceName={csvSourceName}
        csvError={csvError}
      />

      <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-[#0b0f17] via-[#0d121c] to-[#090d14] relative">
        <Header
          facilityName={currentFacility?.name}
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen((previous) => !previous)}
          onGenerateReport={handleGenerateAudit}
          isGeneratingAudit={isGeneratingAudit}
        />

        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-lg shadow-2xl text-xs font-medium">
            {toastMessage}
          </div>
        )}

        {/* =====================================================
            DASHBOARD
        ===================================================== */}
        {activeTab === "dashboard" && (
          <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
            
            <div className="bg-[#111827] rounded-xl border border-slate-800 p-1 flex flex-col">
               <div className="p-4 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/50">
                  <div className="flex items-center space-x-2">
                     <span className="text-slate-300 font-medium">Asset:</span>
                     <span className="bg-slate-800 px-3 py-1 rounded text-slate-200">{currentFacility?.name || "Facility Selected"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span>Live Ingestion: 15-min BACnet Stream</span>
                  </div>
               </div>
               <div className="p-4">
                  <LoadChart 
                    timeseries={timeseries} 
                    anomalyText={chartFooterStats.anomalyText}
                    sampling={chartFooterStats.sampling}
                    zScore={chartFooterStats.zScore}
                  />
               </div>
               <div className="px-6 py-4 flex items-center justify-between text-xs border-t border-slate-800/50 bg-[#0d131f] rounded-b-xl">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2"><span className="w-4 h-1 bg-rose-500 rounded-full"></span><span className="text-slate-300">Actual Load (kW)</span></div>
                    <div className="flex items-center space-x-2"><span className="w-4 h-1 border-t border-dashed border-slate-500"></span><span className="text-slate-300">Baseline (kW)</span></div>
                    <div className="flex items-center space-x-2 text-amber-500 font-medium"><span className="h-2 w-2 rounded-full bg-amber-500"></span><span>Anomalies Flagged: {chartFooterStats.anomalyText}</span></div>
                  </div>
                  <div className="text-slate-500">Sampling: {chartFooterStats.sampling} | Isolation Forest Z-Score: {chartFooterStats.zScore}σ</div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2 text-emerald-400 font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    <span>Active Spatial Waste Breakdown</span>
                  </div>
                  <button onClick={() => setActiveTab("heatmap")} className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">Inspect Floor Plan &gt;</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {isDbLoading ? (
                    <div className="col-span-2 text-center text-slate-500 py-10">Loading live zones from Supabase...</div>
                  ) : (
                    zones.map((zone) => {
                      const isCritical = zone.healthScore < 50;
                      const isWarning = zone.healthScore >= 50 && zone.healthScore < 80;
                      const healthColor = isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400';
                      const bgHealthColor = isCritical ? 'bg-rose-500/20 border-rose-500/30' : isWarning ? 'bg-amber-500/20 border-amber-500/30' : 'bg-emerald-500/20 border-emerald-500/30';
                      const diff = Math.max(0, zone.currentKw - zone.baselineKw);

                      return (
                        <div key={zone.id} className="bg-[#172033] border border-slate-700/50 rounded-lg p-4 flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-200">{zone.name}</h4>
                              <p className="text-xs text-slate-500 max-w-[150px] truncate" title={zone.issue || 'Nominal Status'}>
                                {zone.issue || 'Nominal Status'}
                              </p>
                            </div>
                            <span className={`${bgHealthColor} ${healthColor} text-xs px-2 py-1 rounded font-mono font-medium border`}>
                              +{diff} kW
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-400 border-t border-slate-700/50 pt-3">
                            <span>Usage: <span className="text-slate-200 font-medium">{zone.currentKw} kW</span></span>
                            <span>Health: <span className={`${healthColor} font-medium`}>{zone.healthScore}%</span></span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    <span className="font-semibold text-sm">Gemini Commissioning Copilot</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">Facility Operator Terminal</h3>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Have Gemini diagnose simultaneous heating/cooling, compute custom deadband setpoints, or draft tenant setback notifications.
                  </p>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path></svg></span>
                    <input 
                      type="text" 
                      value={dashboardPrompt} 
                      onChange={(e) => setDashboardPrompt(e.target.value)} 
                      onKeyDown={(e) => { if(e.key === 'Enter') handleDashboardChatLaunch() }} 
                      placeholder={facility === "tower_a" ? '"Why is Chiller Plant drawing 85 kW excess?"' : '"Diagnose Boiler Plant baseline deviation"'}
                      className="w-full bg-[#172033] border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                  <button onClick={handleDashboardChatLaunch} className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l-5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                    <span>Launch AI Terminal Drawer</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <MetricCard title="Total Consumption" value={metrics.totalKwh.toLocaleString("en-IN")} unit="kWh" description={`+${metrics.pctOverBaseline}% vs baseline`} />
              <MetricCard title="Detected Waste" value={metrics.wasteKwh.toLocaleString("en-IN")} unit="kWh" description="Anomalous energy" variant="warning" />
              <MetricCard title="Avoidable CO₂" value={metrics.avoidableCo2Tons} unit="tons" description="Estimated emissions" />
              <MetricCard title="Potential Savings" value={`₹${metrics.annualSavingsEst.toLocaleString("en-IN")}`} unit="/yr" description="Annualized estimate" variant="success" />
            </div>

          </div>
        )}

        {/* =====================================================
            ROUTES
        ===================================================== */}
        {activeTab === "heatmap" && <Heatmap zones={zones} />}
        
        {activeTab === "roi" && (
          <ActionableROI 
            utilityRate={utilityRate}
            facility={facility}
            onExport={handleGenerateAudit}
            onReview={(project) => {
              showToast(`Preparing business case for ${project.name}...`, true);
              setTimeout(() => {
                setChatOpen(true);
                handleSendMessage(`Calculate payback for ${project.name}`);
              }, 600);
            }} 
          />
        )}
        
        {activeTab === "scorecard" && <Scorecard facility={facility} />}
        {activeTab === "sandbox" && <Sandbox facility={facility} utilityRate={utilityRate} />}
        
        {activeTab === "feed" && (
          <WasteFeed 
            anomalies={anomaliesList} 
            timeseries={timeseries} 
            openChat={(anomaly) => { 
              setChatOpen(true); 
              handleSendMessage(`Investigate anomaly on ${anomaly.location}: ${anomaly.description} at ${anomaly.timestamp}. Severity: ${anomaly.severity}. Impact: ${anomaly.impactHr}`); 
            }} 
          />
        )}
        
        {activeTab === "leaderboard" && <Leaderboard facility={facility} />}
        
        {activeTab === "weather" && (
          <WeatherPanel
            facility={currentFacility}
            baselineKwByHour={baselineKwByHour}
            wasteRatio={wasteRatio}
            utilityRate={utilityRate}
          />
        )}

        {activeTab === "simulator" && <Simulator trigger={handleInjectAnomaly} />}
        {showReportModal && <ReportModal content={aiReportContent} close={() => setShowReportModal(false)} />}
      </main>

      {chatOpen && <AIChat messages={chatMessages} input={chatInput} setInput={setChatInput} send={handleSendMessage} thinking={isThinking} close={() => setChatOpen(false)} chatEndRef={chatEndRef} />}
    </div>
  );
}