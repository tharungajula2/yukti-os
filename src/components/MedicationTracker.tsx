"use client";

import { useState, useEffect } from "react";
import { Pill, Check, Calendar as CalendarIcon, PlusCircle, AlertCircle, Clock, Trash2, Activity, Heart, Scale, Droplet, ChevronLeft, ChevronRight, Edit3, ArrowLeft, Watch, Bluetooth } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./ui/Toast";

interface Medication {
    name: string;
    dosage: string;
    timing: string;
    type?: "Acute" | "Chronic";
    status?: "Active" | "Archived";
    duration?: string;
    startDate?: string;
    // New Structured Fields
    slots?: ("Morning" | "Afternoon" | "Evening" | "Night")[];
    relationToFood?: "Before Food" | "After Food";
    remarks?: string;
}

interface Vitals {
    bpSys?: number;
    bpDia?: number;
    sugar?: number;
    weight?: number;
}

interface DailyLog {
    meds: string[]; // List of med names taken
    vitals: Vitals;
    habits?: {
        mealPlan?: boolean; // Yes/No
        activity?: number; // Mins
        hydration?: number; // Glasses
    };
    notes?: string;
}

interface MedicationTrackerProps {
    onTriggerCall?: () => void;
}

export function MedicationTracker({ onTriggerCall }: MedicationTrackerProps) {
    const { showToast } = useToast();
    // --- STATE ---
    const [meds, setMeds] = useState<Medication[]>([]);
    const [activeTab, setActiveTab] = useState<"daily" | "calendar" | "manage">("daily");

    // Date Context
    const [todayKey, setTodayKey] = useState("");
    const [viewingDate, setViewingDate] = useState(""); // The date currently being viewed/edited

    // Log Data for Viewing Date
    const [activeLog, setActiveLog] = useState<DailyLog>({ meds: [], vitals: {} });

    // Vitals & Habits Input (Temporary State for Form)
    const [statsInput, setStatsInput] = useState<Vitals>({});
    const [habitsInput, setHabitsInput] = useState<{ mealPlan: boolean, activity: string, hydration: string }>({
        mealPlan: false, activity: "", hydration: ""
    });

    // Calendar Data
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [historyData, setHistoryData] = useState<Record<string, DailyLog>>({}); // Cache of logs

    // Edit Mode (Manage Tab)
    const [editingMed, setEditingMed] = useState<Medication | null>(null);
    const [isAddingMed, setIsAddingMed] = useState(false);
    const [newMed, setNewMed] = useState<Medication>({
        name: "", dosage: "", timing: "", type: "Chronic", status: "Active",
        slots: [], relationToFood: "After Food", remarks: ""
    });

    // --- INITIALIZATION ---
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setTodayKey(today);

        // Default to today if not set
        if (!viewingDate) setViewingDate(today);

        // 1. Load Meds
        const savedMeds = localStorage.getItem("yukti_active_meds");
        if (savedMeds) {
            try {
                const parsed = JSON.parse(savedMeds);
                // Migration safety
                const migrated = parsed.map((m: any) => ({
                    ...m,
                    status: m.status || "Active",
                    type: m.type || "Chronic"
                }));
                setMeds(migrated);
            } catch (e) { console.error("Meds parse error", e); }
        }

        // 2. Load History for Calendar context
        loadHistoryContext();

        // 3. Timer Logic (Fake Call Trigger)
        const interval = setInterval(() => {
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes();
            if (m === 0 && (h === 9 || h === 13 || h === 21)) {
                const activeMedsExist = meds.some(m => !m.status || m.status === 'Active');
                if (activeMedsExist && onTriggerCall) onTriggerCall();
            }
        }, 60000);
        return () => clearInterval(interval);

    }, [meds.length]); // Re-load if meds list changes length/init

    // --- EFFECT: LOAD LOG WHEN DATE CHANGES ---
    useEffect(() => {
        if (!viewingDate) return;
        loadDailyLog(viewingDate).then(log => {
            setActiveLog(log);
            setStatsInput(log.vitals || {}); // Prefill inputs
            if (log.habits) {
                setHabitsInput({
                    mealPlan: log.habits.mealPlan || false,
                    activity: log.habits.activity?.toString() || "",
                    hydration: log.habits.hydration?.toString() || ""
                });
            } else {
                setHabitsInput({ mealPlan: false, activity: "", hydration: "" }); // Reset
            }
        });
    }, [viewingDate, historyData]); // Reload when date or history cache changes

    // --- LOGIC: DATA IO ---

    const getLogKey = (date: string) => `yukti_daily_log_${date}`;

    const loadDailyLog = async (date: string): Promise<DailyLog> => {
        const key = getLogKey(date);
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);

        // Fallback to history cache if available
        if (historyData[date]) return historyData[date];

        return { meds: [], vitals: {} };
    };

    const loadHistoryContext = () => {
        const cache: Record<string, DailyLog> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith("yukti_daily_log_")) {
                const date = key.replace("yukti_daily_log_", "");
                try {
                    cache[date] = JSON.parse(localStorage.getItem(key) || "{}");
                } catch (e) { }
            }
        }
        setHistoryData(cache);
    };

    const saveLog = (date: string, log: DailyLog) => {
        localStorage.setItem(getLogKey(date), JSON.stringify(log));
        // Update state cache and current view
        setHistoryData(prev => ({ ...prev, [date]: log }));
        setActiveLog(log);
    };

    // --- LOGIC: ACTIONS ---

    const simulateDeviceSync = (device: 'cgm' | 'watch') => {
        if (device === 'cgm') {
            setStatsInput(prev => ({ ...prev, sugar: 110 }));
            showToast("⚡ Synced 110 mg/dL from Freestyle Libre", "success");
        }
        if (device === 'watch') {
            setStatsInput(prev => ({ ...prev, weight: 64.5 }));
            setHabitsInput(prev => ({ ...prev, activity: "45" }));
            showToast("⚡ Synced Activity & Weight from Apple Health", "success");
        }
    };

    const toggleMed = (medName: string) => {
        const isTaken = activeLog.meds.includes(medName);
        let newMedsList;
        if (isTaken) {
            newMedsList = activeLog.meds.filter(m => m !== medName);
        } else {
            newMedsList = [...activeLog.meds, medName];
        }
        const newLog = { ...activeLog, meds: newMedsList };
        saveLog(viewingDate, newLog);
    };

    const saveVitalsAndHabits = () => {
        const newLog = {
            ...activeLog,
            vitals: statsInput,
            habits: {
                mealPlan: habitsInput.mealPlan,
                activity: Number(habitsInput.activity),
                hydration: Number(habitsInput.hydration)
            }
        };
        saveLog(viewingDate, newLog);
        showToast(`Log updated for ${viewingDate}! ✅`, "success");
    };

    const saveMedsList = (newMeds: Medication[]) => {
        setMeds(newMeds);
        localStorage.setItem("yukti_active_meds", JSON.stringify(newMeds));
    };

    const changeDate = (days: number) => {
        const current = new Date(viewingDate);
        current.setDate(current.getDate() + days);
        setViewingDate(current.toISOString().split('T')[0]);
    };

    // --- MANAGE MEDS LOGIC ---
    // (Same as before)
    const updateMed = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMed) return;
        const updated = meds.map(m => m.name === editingMed.name ? editingMed : m);
        saveMedsList(updated);
        setEditingMed(null);
    };

    const addMed = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMed.name) return;
        let derivedTiming = newMed.timing;
        if (!derivedTiming && newMed.slots && newMed.slots.length > 0) {
            derivedTiming = `${newMed.slots.join("-")} (${newMed.relationToFood})`;
        }
        const toAdd = { ...newMed, timing: derivedTiming, startDate: new Date().toISOString().split('T')[0] };
        const updated = [...meds, toAdd];
        saveMedsList(updated);
        setIsAddingMed(false);
        setNewMed({
            name: "", dosage: "", timing: "", type: "Chronic", status: "Active",
            slots: [], relationToFood: "After Food", remarks: ""
        });
    };


    // --- CALENDAR RENDERER ---
    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const log = historyData[dateStr];
            const isToday = dateStr === todayKey;
            const isSelected = dateStr === viewingDate;

            let statusParams = "bg-slate-50 text-slate-400";
            let dotColor = null;

            if (new Date(dateStr) <= new Date()) {
                const activeMedsRaw = localStorage.getItem("yukti_active_meds");
                const currentMedsList = activeMedsRaw ? JSON.parse(activeMedsRaw) : [];
                const activeMedsCount = currentMedsList.filter((m: any) => !m.status || m.status === 'Active').length || 1;

                if (log) {
                    const takenCount = log.meds.length;
                    const hasVitals = Object.keys(log.vitals || {}).length > 0;
                    if (takenCount >= activeMedsCount) {
                        statusParams = "bg-emerald-100 text-emerald-700 font-bold border-emerald-200";
                    } else if (takenCount > 0) {
                        statusParams = "bg-orange-100 text-orange-700 font-bold border-orange-200";
                    } else {
                        statusParams = "bg-red-50 text-red-400 border-red-100";
                    }
                    if (hasVitals) dotColor = "bg-blue-500";
                }
            }

            days.push(
                <button
                    key={d}
                    onClick={() => { setViewingDate(dateStr); setActiveTab("daily"); }} // Go to daily view on click
                    className={`h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center relative text-sm transition-all border ${isSelected ? "ring-2 ring-slate-900 z-10 scale-110" : ""
                        } ${statusParams}`}
                >
                    {d}
                    {dotColor && <div className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${dotColor}`} />}
                </button>
            );
        }

        return (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft size={20} /></button>
                    <h3 className="font-bold text-slate-900">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={20} /></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="text-xs font-bold text-slate-400">{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {days}
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---
    const activeMeds = meds.filter(m => !m.status || m.status === 'Active');

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* TABS HEADER */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-100/50 p-1.5 rounded-2xl">
                <div className="flex gap-1 w-full md:w-auto">
                    {[
                        { id: "daily", label: "Daily Care", icon: Check },
                        { id: "calendar", label: "History", icon: CalendarIcon },
                        { id: "manage", label: "Manage Meds", icon: pillIcon(meds.length) }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                                ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5"
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Test Call */}
                <button onClick={onTriggerCall} className="flex text-xs text-slate-400 hover:text-orange-600 gap-1 items-center px-3 border border-slate-200/50 rounded-lg py-1 md:border-none md:p-0">
                    <Clock size={12} /> <span className="hidden md:inline">Test Reminder</span><span className="md:hidden">Test Call</span>
                </button>
            </div>

            {/* --- TAB 1: DAILY CARE (Dynamic Date) --- */}
            {activeTab === "daily" && (
                <div className="space-y-6">
                    {/* DATE NAVIGATOR */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronLeft size={20} /></button>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-slate-900">
                                {viewingDate === todayKey ? "Today, " : ""}{new Date(viewingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </h3>
                            {viewingDate !== todayKey && (
                                <button onClick={() => setViewingDate(todayKey)} className="text-xs font-bold text-orange-600 uppercase tracking-wide mt-1 hover:underline">
                                    Return to Today
                                </button>
                            )}
                        </div>
                        <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronRight size={20} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* LEFT: Meds Checklist (7 cols) */}
                        <div className="md:col-span-7 space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Pill size={18} className="text-orange-500" /> Daily Medicines
                                </h3>
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                                    {activeLog.meds.length} / {activeMeds.length} Taken
                                </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {activeMeds.map((med, idx) => {
                                    const isTaken = activeLog.meds.includes(med.name);
                                    return (
                                        <motion.div
                                            key={idx}
                                            layout
                                            onClick={() => toggleMed(med.name)}
                                            className={`group cursor-pointer p-4 rounded-2xl border flex items-center justify-between transition-all ${isTaken
                                                ? "bg-emerald-50/60 border-emerald-100"
                                                : "bg-white border-slate-200 hover:border-orange-300 shadow-sm hover:shadow-md"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isTaken ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300 group-hover:bg-orange-100 group-hover:text-orange-500"
                                                    }`}>
                                                    <Check size={20} strokeWidth={3} />
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold ${isTaken ? "text-emerald-900 line-through opacity-70" : "text-slate-900"}`}>{med.name}</h4>
                                                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                                                        <span className="font-semibold">{med.dosage}</span>
                                                        {med.slots && med.slots.length > 0 ? (
                                                            <div className="flex gap-1">
                                                                {med.slots.map(s => <span key={s} className="bg-slate-100 px-1.5 rounded text-[10px]">{s}</span>)}
                                                            </div>
                                                        ) : (
                                                            <span>• {med.timing}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT: Vitals & Habits (5 cols) */}
                        <div className="md:col-span-5 space-y-6">
                            {/* 1. VITALS CARD */}
                            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 relative">
                                <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4">
                                    <Activity size={18} className="text-blue-600" /> Vitals for {new Date(viewingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1 block">Blood Pressure (Sys/Dia)</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="120"
                                                    value={statsInput.bpSys || ""}
                                                    onChange={e => setStatsInput({ ...statsInput, bpSys: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-semibold text-slate-700"
                                                />
                                            </div>
                                            <span className="text-slate-300 text-xl font-light">/</span>
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="80"
                                                    value={statsInput.bpDia || ""}
                                                    onChange={e => setStatsInput({ ...statsInput, bpDia: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-semibold text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1 block">Sugar</label>
                                            <input
                                                type="number"
                                                placeholder="100"
                                                value={statsInput.sugar || ""}
                                                onChange={e => setStatsInput({ ...statsInput, sugar: Number(e.target.value) })}
                                                className="w-full px-3 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-semibold text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1 block">Weight</label>
                                            <input
                                                type="number"
                                                placeholder="65"
                                                value={statsInput.weight || ""}
                                                onChange={e => setStatsInput({ ...statsInput, weight: Number(e.target.value) })}
                                                className="w-full px-3 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-semibold text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. DEVICE SYNC (Moved Up & Compacted) */}
                            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Activity size={80} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Bluetooth size={18} className="text-blue-600" /> Connected Devices
                                    </h3>
                                </div>

                                <div className="flex flex-col gap-3 relative z-10">
                                    {/* Card 1: CGM */}
                                    <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                <Activity size={16} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-xs">FreeStyle Libre</h4>
                                                <p className="text-[10px] text-slate-500 font-medium">110 mg/dL (Now)</p>
                                            </div>
                                        </div>
                                        <button onClick={() => simulateDeviceSync('cgm')} className="text-[10px] font-bold text-white bg-emerald-500 px-2 py-1 rounded-full shadow-sm hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-1">
                                            Sync
                                        </button>
                                    </div>

                                    {/* Card 2: Smart Watch */}
                                    <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Watch size={16} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-xs">Apple Watch</h4>
                                                <p className="text-[10px] text-slate-500 font-medium">Steps, HR, Wgt</p>
                                            </div>
                                        </div>
                                        <button onClick={() => simulateDeviceSync('watch')} className="text-[10px] font-bold text-white bg-blue-500 px-2 py-1 rounded-full shadow-sm hover:bg-blue-600 active:scale-95 transition-all flex items-center gap-1">
                                            Sync
                                        </button>
                                    </div>

                                    {/* Card 3: BP Monitor (Disconnected) */}
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 border-dashed flex items-center justify-between opacity-70 hover:opacity-100 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-200 text-slate-500 rounded-lg">
                                                <Heart size={16} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700 text-xs">Omron BP</h4>
                                                <p className="text-[10px] text-slate-400 font-medium">Disconnected</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-orange-400">Pair</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. HABITS CARD (Moved Down) */}
                            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 relative">
                                <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4">
                                    <Activity size={18} className="text-emerald-600" /> Lifestyle & Habits
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100/50">
                                        <label className="text-sm font-semibold text-slate-700">Followed Meal Plan?</label>
                                        <button
                                            onClick={() => setHabitsInput({ ...habitsInput, mealPlan: !habitsInput.mealPlan })}
                                            className={`w-12 h-7 rounded-full transition-colors relative ${habitsInput.mealPlan ? "bg-emerald-500" : "bg-slate-200"}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${habitsInput.mealPlan ? "translate-x-5" : "translate-x-0"}`} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1 block">Activity (Mins)</label>
                                            <input
                                                type="number"
                                                placeholder="30"
                                                value={habitsInput.activity}
                                                onChange={e => setHabitsInput({ ...habitsInput, activity: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-semibold text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1 block">Water (Glasses)</label>
                                            <input
                                                type="number"
                                                placeholder="8"
                                                value={habitsInput.hydration}
                                                onChange={e => setHabitsInput({ ...habitsInput, hydration: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-semibold text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={saveVitalsAndHabits}
                                className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
                            >
                                Save Log for {new Date(viewingDate).toLocaleDateString()}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 2: CALENDAR --- */}
            {activeTab === "calendar" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-7">
                        {renderCalendar()}
                    </div>
                    <div className="md:col-span-5">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg h-full flex flex-col justify-center items-center text-center">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">History Mode</h3>
                            <p className="text-slate-500 mb-6">Select a date on the calendar to view or edit its detailed log.</p>
                            <div className="flex gap-2 text-sm text-slate-400">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Perfect</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> Partial</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> Missed</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 3: MANAGE MEDS --- */}
            {activeTab === "manage" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Manage Inventory</h3>
                            <p className="text-sm text-slate-500">Edit dosages or add manual supplements.</p>
                        </div>
                        <button
                            onClick={() => setIsAddingMed(true)}
                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm"
                        >
                            <PlusCircle size={16} /> Add New
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {/* ADD NEW FORM */}
                        {isAddingMed && (
                            <motion.div layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border-2 border-orange-200 shadow-md">
                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><PlusCircle size={18} className="text-orange-600" /> Add Custom Medicine</h4>
                                <form onSubmit={addMed} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Medicine Name</label>
                                        <input
                                            placeholder="e.g. Coconut Oil / Vitamin D"
                                            value={newMed.name}
                                            onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                                            className="w-full mt-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Structured Slots */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Time of Day</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {["Morning", "Afternoon", "Evening", "Night"].map((slot) => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = newMed.slots || [];
                                                        const updated = current.includes(slot as any)
                                                            ? current.filter(s => s !== slot)
                                                            : [...current, slot];
                                                        setNewMed({ ...newMed, slots: updated as any });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${(newMed.slots || []).includes(slot as any)
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                                                        }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Food Relation */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Relation to Food</label>
                                        <div className="flex gap-4">
                                            {["Before Food", "After Food"].map((opt) => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="foodRel"
                                                        checked={newMed.relationToFood === opt}
                                                        onChange={() => setNewMed({ ...newMed, relationToFood: opt as any })}
                                                        className="text-orange-600 focus:ring-orange-500"
                                                    />
                                                    <span className="text-sm text-slate-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Dosage</label>
                                        <input
                                            placeholder="e.g. 1 Tablet / 1 tsp"
                                            value={newMed.dosage}
                                            onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                                            className="w-full mt-1 p-2 border rounded-lg text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Remarks (Optional)</label>
                                        <input
                                            placeholder="e.g. Use warm water"
                                            value={newMed.remarks || ""}
                                            onChange={e => setNewMed({ ...newMed, remarks: e.target.value })}
                                            className="w-full mt-1 p-2 border rounded-lg text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                                        <select value={newMed.type} onChange={e => setNewMed({ ...newMed, type: e.target.value as any })} className="w-full mt-1 p-2 border rounded-lg text-sm">
                                            <option value="Chronic">Chronic (Daily/Long-term)</option>
                                            <option value="Acute">Acute (Short-term)</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <button type="button" onClick={() => setIsAddingMed(false)} className="px-4 py-2 text-slate-500 text-sm">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Add to List</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                        {meds.map((med, idx) => {
                            // EDIT MODE (Inline)
                            if (editingMed?.name === med.name) {
                                return (
                                    <motion.div key={idx} layout className="bg-white p-6 rounded-2xl border-2 border-orange-100 shadow-md">
                                        <h4 className="font-bold text-slate-900 mb-4">Edit {med.name}</h4>
                                        <form onSubmit={updateMed} className="space-y-4">

                                            {/* Structured Slots */}
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Time of Day</label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {["Morning", "Afternoon", "Evening", "Night"].map((slot) => (
                                                        <button
                                                            key={slot}
                                                            type="button"
                                                            onClick={() => {
                                                                const current = editingMed.slots || [];
                                                                const updated = current.includes(slot as any)
                                                                    ? current.filter(s => s !== slot)
                                                                    : [...current, slot];
                                                                setEditingMed({ ...editingMed, slots: updated as any });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${(editingMed.slots || []).includes(slot as any)
                                                                ? "bg-blue-600 text-white border-blue-600"
                                                                : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                                                                }`}
                                                        >
                                                            {slot}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Food Relation */}
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Relation to Food</label>
                                                <div className="flex gap-4">
                                                    {["Before Food", "After Food"].map((opt) => (
                                                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`foodRel-${idx}`} // Unique name per item
                                                                checked={editingMed.relationToFood === opt}
                                                                onChange={() => setEditingMed({ ...editingMed, relationToFood: opt as any })}
                                                                className="text-orange-600 focus:ring-orange-500"
                                                            />
                                                            <span className="text-sm text-slate-700">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Dosage</label>
                                                    <input value={editingMed.dosage} onChange={e => setEditingMed({ ...editingMed, dosage: e.target.value })} className="w-full mt-1 p-2 border rounded-lg text-sm" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                                                    <select value={editingMed.type} onChange={e => setEditingMed({ ...editingMed, type: e.target.value as any })} className="w-full mt-1 p-2 border rounded-lg text-sm">
                                                        <option value="Chronic">Chronic</option>
                                                        <option value="Acute">Acute</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Remarks</label>
                                                <input value={editingMed.remarks || ""} onChange={e => setEditingMed({ ...editingMed, remarks: e.target.value })} className="w-full mt-1 p-2 border rounded-lg text-sm" />
                                            </div>
                                            <div className="flex gap-2 justify-end pt-2">
                                                <button type="button" onClick={() => setEditingMed(null)} className="px-4 py-2 text-slate-500 text-sm">Cancel</button>
                                                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Save Changes</button>
                                            </div>
                                        </form>
                                    </motion.div>
                                );
                            }

                            // DISPLAY CARD
                            return (
                                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-orange-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                                            <Pill size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{med.name}</h4>
                                            <p className="text-xs text-slate-500">{med.dosage} • {med.timing}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingMed(med)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit3 size={16} />
                                        </button>
                                        <button onClick={() => {
                                            if (confirm("Stop taking this medicine? It will be moved to history.")) {
                                                const updated = meds.map(m => m.name === med.name ? { ...m, status: "Archived" as const } : m);
                                                saveMedsList(updated);
                                            }
                                        }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function pillIcon(count: number) {
    return ({ size }: { size: number }) => (
        <div className="relative">
            <Pill size={size} />
            {count > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-orange-500 text-[8px] text-white">{count}</span>}
        </div>
    )
}
