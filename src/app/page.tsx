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
                Load Founder's Demo (Mukesh)
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

        // Clear all med logs
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("yukti_med_log_")) {
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
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Welcome back, Tharun</h1>
            <p className="text-sm text-slate-600">System operating at nominal capacity.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
              <Bell size={20} />
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full bg-orange-100 border border-orange-200">
              {/* Avatar placeholder */}
              <div className="h-full w-full flex items-center justify-center text-orange-700 font-medium">T</div>
            </div>
          </div>
        </header>

        {activeView === "dashboard" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Activity size={20} />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Patient Vitals</h3>
              <p className="text-sm text-slate-500 mt-1">Real-time monitoring active.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Active Patients</h3>
              <p className="text-sm text-slate-500 mt-1">12 patients currently checked in.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Pending Reports</h3>
              <p className="text-sm text-slate-500 mt-1">3 reports require analysis.</p>
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
    </div>
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
