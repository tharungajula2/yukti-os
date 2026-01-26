"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, FileText, BookOpen, Users, Lock, ArrowRight, Activity, Bell, MessageCircle } from "lucide-react";
import { loadDemoData } from "../utils/demoData";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("yukti_auth_v2");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "praan2026") {
      localStorage.setItem("yukti_auth_v2", "true");
      setIsAuthenticated(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 p-8 shadow-xl backdrop-blur-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Lock size={24} />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">Yukti Health</h1>
              <p className="text-sm text-slate-500">Yukti OS v2.0</p>
              <p className="text-xs text-orange-600 font-medium mt-1">by Tharun Kumar Gajula</p>
            </div>

            <div className="mb-6 rounded-lg bg-orange-50/50 p-4 text-center">
              <p className="text-xs font-medium text-orange-800 tracking-wide uppercase">
                Restricted Access
              </p>
              <p className="text-sm text-orange-600">Founder's Office Protocol</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <motion.div
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Access Key"
                  className={`w-full rounded-xl border bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${error
                    ? "border-red-500 focus:ring-red-200"
                    : "border-slate-200 focus:border-orange-500 focus:ring-orange-200"
                    }`}
                  autoFocus
                />
              </motion.div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-medium text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-orange-600/30 active:scale-[0.98]"
              >
                Initialize System
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => loadDemoData()}
                className="w-full py-2 text-xs font-semibold text-orange-600 hover:text-orange-700 uppercase tracking-widest hover:bg-orange-50/50 rounded-lg transition-colors border border-transparent hover:border-orange-100"
              >
                Load Founder's Demo (Chaaya)
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return <DashboardShell />;
}

import { SmartReport } from "../components/SmartReport";
import { ClinicalEngine } from "../components/ClinicalEngine";
import { MedicationTracker } from "../components/MedicationTracker";
import { CareTeam } from "../components/CareTeam";
import { WhatsAppDemo } from "../components/WhatsAppDemo";
import { HeaderIcons } from "../components/HeaderIcons";
import { LogOut, Trash2 } from "lucide-react";

function DashboardShell() {
  const [activeView, setActiveView] = useState("dashboard");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSystemReset = () => {
    if (confirm("⚠️ DANGER: Are you sure you want to wipe Yukti's memory?\n\nThis will delete all Clinical Profiles, Reports, History, and Medicine Logs. This cannot be undone.")) {
      // Double confirmation for safety
      if (confirm("FINAL WARNING: This action is irreversible. Confirm reset?")) {
        localStorage.removeItem("yukti_auth_v2");
        localStorage.removeItem("yukti_assessment_data_v2");
        localStorage.removeItem("yukti_history");
        localStorage.removeItem("yukti_latest_summary");
        localStorage.removeItem("yukti_active_meds");

        // Clear Identity
        localStorage.removeItem("yukti_user_name");
        localStorage.removeItem("yukti_user_gender");
        localStorage.removeItem("yukti_user_age");

        // Clear all med logs (including new daily logs)
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("yukti_med_log_") || key.startsWith("yukti_daily_log_")) {
            localStorage.removeItem(key);
          }
        });

        window.location.reload();
      }
    }
  };

  return (
    <div className="flex min-h-screen relative">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">Y</div>
          <span className="font-semibold text-slate-900">Yukti OS</span>
        </div>
        <div className="w-10"></div> {/* Spacer balance */}
      </div>

      {/* MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200/60 bg-white shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto md:bg-white/60 md:backdrop-blur-md`}>
        <div className="flex h-16 items-center px-6 justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView("dashboard")}>
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
              Y
            </div>
            <span className="font-semibold text-slate-900">Yukti OS</span>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <NavItem
            icon={<Stethoscope size={20} />}
            label="Clinical Engine"
            active={activeView === "clinical"}
            onClick={() => setActiveView("clinical")}
          />
          <NavItem
            icon={<FileText size={20} />}
            label="Smart Reports"
            isNew
            active={activeView === "smart-reports"}
            onClick={() => setActiveView("smart-reports")}
          />
          <NavItem
            icon={<BookOpen size={20} />}
            label="Daily Wellness"
            active={activeView === "medicines"}
            onClick={() => setActiveView("medicines")}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Care Team"
            active={activeView === "care-team"}
            onClick={() => setActiveView("care-team")}
          />
          <NavItem
            icon={<MessageCircle size={20} />}
            label="WhatsApp Bot"
            isNew
            active={activeView === "whatsapp"}
            onClick={() => setActiveView("whatsapp")}
          />


          {/* Spacer */}
          <div className="pt-8 mt-auto space-y-2">
            <button
              onClick={loadDemoData}
              className="group flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
              title="Load Demo Profile"
            >
              <div className="flex items-center justify-center">
                <span className="font-bold text-lg">⚡</span>
              </div>
              Load Demo Data
            </button>

            <button
              onClick={handleSystemReset}
              className="group flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
              title="Wipe Memory"
            >
              <div className="flex items-center justify-center">
                <Trash2 size={16} />
              </div>
              Reset System Context
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:p-8 overflow-x-hidden">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
              Welcome back, {typeof window !== 'undefined' ? (localStorage.getItem('yukti_user_name') || 'User') : 'User'}
            </h1>
            <p className="text-sm text-slate-600">System operating at nominal capacity.</p>
          </div>
          <HeaderIcons />
        </header>

        {activeView === "dashboard" && (
          <div className="space-y-8">
            {/* 1. WELCOME SECTION */}
            <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-2xl font-bold text-slate-900 mb-2">
                  {(() => {
                    const h = new Date().getHours();
                    if (h < 12) return "Good Morning";
                    if (h < 18) return "Good Afternoon";
                    return "Good Evening";
                  })()}, {typeof window !== 'undefined' ? (localStorage.getItem('yukti_user_name') || 'User') : 'User'}! ☀️
                </h2>
                <p className="text-slate-600">
                  Here is your daily health summary. System is <span className="text-emerald-600 font-bold flex inline-flex items-center gap-1"><Activity size={12} /> Active</span>.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveView("smart-reports")}
                  className="bg-white text-slate-700 px-4 py-2 rounded-xl font-semibold text-sm border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <FileText size={16} /> Upload Report
                </button>
                <button
                  onClick={() => setActiveView("medicines")}
                  className="bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-md shadow-orange-200 hover:bg-orange-700 transition-all flex items-center gap-2"
                >
                  <BookOpen size={16} /> Log Meds
                </button>
              </div>
            </div>

            {/* 2. THREE PILLARS (Context Aware) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* CARD 1: HEALTH SHIELD (Clinical Engine) */}
              {(() => {
                let assessment = null;
                if (typeof window !== 'undefined') {
                  try { assessment = JSON.parse(localStorage.getItem("yukti_assessment_data_v2") || "null"); } catch (e) { }
                }

                if (!assessment) {
                  return (
                    <div
                      onClick={() => setActiveView("clinical")}
                      className="group cursor-pointer p-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-orange-300 transition-all flex flex-col items-center justify-center text-center h-48"
                    >
                      <div className="h-12 w-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                        <Stethoscope size={24} />
                      </div>
                      <h3 className="font-bold text-slate-700 mb-1">Assessment Pending</h3>
                      <p className="text-xs text-slate-500 mb-3">Complete your profile to activate <br /> AI Risk Monitoring.</p>
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Start Now &rarr;</span>
                    </div>
                  );
                }

                // Parse Risk
                const riskScore = assessment.riskScore || assessment.total || 0; // Fallback
                let color = "text-emerald-600 bg-emerald-50 border-emerald-100";
                let label = "Healthy Baseline";
                if (assessment.riskLevel?.includes("High") || riskScore > 40) {
                  color = "text-red-600 bg-red-50 border-red-100";
                  label = "Attention Required";
                } else if (assessment.riskLevel?.includes("Moderate") || riskScore > 20) {
                  color = "text-amber-600 bg-amber-50 border-amber-100";
                  label = "Moderate Watch";
                }

                return (
                  <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-48 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Stethoscope size={80} className="text-slate-900" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${color} bg-opacity-20`}>
                          <Activity size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Health Shield</span>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900">{assessment.riskLevel || "Analyzed"}</h3>
                      <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
                    </div>
                    <div className="mt-4">
                      <button onClick={() => setActiveView("clinical")} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                        View Assessment <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                )
              })()}

              {/* CARD 2: DAILY WELLNESS (Meds) */}
              {(() => {
                let activeMeds = 0;
                let takenCount = 0;
                if (typeof window !== 'undefined') {
                  const meds = JSON.parse(localStorage.getItem("yukti_active_meds") || "[]");
                  const today = new Date().toISOString().split('T')[0];
                  const log = JSON.parse(localStorage.getItem(`yukti_daily_log_${today}`) || '{"meds":[]}');
                  activeMeds = meds.filter((m: any) => !m.status || m.status === 'Active').length;
                  takenCount = log.meds.length;
                }

                if (activeMeds === 0) {
                  return (
                    <div
                      onClick={() => setActiveView("medicines")}
                      className="group cursor-pointer p-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all flex flex-col items-center justify-center text-center h-48"
                    >
                      <div className="h-12 w-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <BookOpen size={24} />
                      </div>
                      <h3 className="font-bold text-slate-700 mb-1">No Medicines</h3>
                      <p className="text-xs text-slate-500 mb-3">Add your daily prescriptions <br /> to track adherence.</p>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Setup &rarr;</span>
                    </div>
                  );
                }

                return (
                  <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-48 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <BookOpen size={80} className="text-slate-900" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          <BookOpen size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Daily Adherence</span>
                      </div>
                      <h3 className="text-4xl font-bold text-slate-900 flex items-baseline gap-2">
                        {takenCount} <span className="text-xl text-slate-400 font-medium">/ {activeMeds}</span>
                      </h3>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        {takenCount === activeMeds ? "All done for today! 🎉" : `${activeMeds - takenCount} doses remaining.`}
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(takenCount / activeMeds) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* CARD 3: RECENT ACTIVITY */}
              {(() => {
                let lastReport = null;
                if (typeof window !== 'undefined') {
                  const history = JSON.parse(localStorage.getItem("yukti_history") || "[]");
                  if (history.length > 0) lastReport = history[history.length - 1];
                }

                if (!lastReport) {
                  return (
                    <div
                      onClick={() => setActiveView("smart-reports")}
                      className="group cursor-pointer p-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-all flex flex-col items-center justify-center text-center h-48"
                    >
                      <div className="h-12 w-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        <FileText size={24} />
                      </div>
                      <h3 className="font-bold text-slate-700 mb-1">No Analysis Yet</h3>
                      <p className="text-xs text-slate-500 mb-3">Upload a lab report to see <br /> AI insights here.</p>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Upload &rarr;</span>
                    </div>
                  );
                }

                return (
                  <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-48 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <FileText size={80} className="text-slate-900" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                          <FileText size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Latest Insight</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight">
                        {lastReport.summary ? lastReport.summary.substring(0, 60) + "..." : "Lab Report Analyzed"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 font-mono">
                        {lastReport.meta?.reportDate || "Recent Upload"}
                      </p>
                    </div>
                    <div className="mt-4">
                      <button onClick={() => setActiveView("smart-reports")} className="text-emerald-600 text-xs font-bold uppercase tracking-wide hover:underline">
                        Read Full Analysis
                      </button>
                    </div>
                  </div>
                )
              })()}

            </div>

            {/* 3. WHATSAPP BANNER (New) */}
            <div
              onClick={() => setActiveView("whatsapp")}
              className="cursor-pointer bg-gradient-to-r from-[#25D366] to-[#128C7E] p-1 rounded-3xl shadow-lg shadow-green-100 transform hover:scale-[1.01] transition-all"
            >
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-[20px] flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-[#128C7E]">
                    <MessageCircle size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Enable WhatsApp Care Assistant</h3>
                    <p className="text-white/80 text-sm">Get medication reminders and daily summaries directly on WhatsApp.</p>
                  </div>
                </div>
                <div className="bg-white text-[#128C7E] px-4 py-2 rounded-xl font-bold text-sm">
                  Activate Demo
                </div>
              </div>
            </div>

          </div>
        )}

        {activeView === "smart-reports" && <SmartReport onNavigate={() => setActiveView("clinical")} />}
        {activeView === "clinical" && <ClinicalEngine />}
        {activeView === "medicines" && <MedicationTracker onTriggerCall={() => setIsCallActive(true)} />}

        {activeView === "care-team" && <CareTeam />}
        {activeView === "whatsapp" && <WhatsAppDemo />}

      </main>

      {/* GLOBAL OVERLAYS */}
      <CallOverlay
        isOpen={isCallActive}
        onAccept={() => {
          setIsCallActive(false);
          setActiveView("medicines");
        }}
        onDecline={() => setIsCallActive(false)}
      />
    </div >
  );
}

import { CallOverlay } from "../components/CallOverlay";

function NavItem({ icon, label, active = false, isNew = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; isNew?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active
        ? "bg-orange-50 text-orange-900"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-orange-600" : "text-slate-400 group-hover:text-slate-600"}>
          {icon}
        </span>
        {label}
      </div>
      {isNew && (
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
          NEW
        </span>
      )}
    </button>
  );
}
