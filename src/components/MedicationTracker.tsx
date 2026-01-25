"use client";

import { useState, useEffect } from "react";
import { Pill, Check, Calendar as CalendarIcon, PlusCircle, AlertCircle, Clock, Trash2, Activity, Heart, Scale, Droplet, ChevronLeft, ChevronRight, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    // --- STATE ---
    const [meds, setMeds] = useState<Medication[]>([]);
    const [activeTab, setActiveTab] = useState<"today" | "calendar" | "manage">("today");

    // Today's Data
    const [todayKey, setTodayKey] = useState("");
    const [todayLog, setTodayLog] = useState<DailyLog>({ meds: [], vitals: {} });

    // Vitals & Habits Input
    const [statsInput, setStatsInput] = useState<Vitals>({});
    const [habitsInput, setHabitsInput] = useState<{ mealPlan: boolean, activity: string, hydration: string }>({
        mealPlan: false, activity: "", hydration: ""
    });

    // Calendar Data
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
    const [historyData, setHistoryData] = useState<Record<string, DailyLog>>({}); // Cache of month's logs

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
        setSelectedDate(today);

        // 1. Load Meds
        const savedMeds = localStorage.getItem("yukti_active_meds");
        if (savedMeds) {
            try {
                const parsed = JSON.parse(savedMeds);
                const migrated = parsed.map((m: any) => ({
                    ...m,
                    status: m.status || "Active",
                    type: m.type || "Chronic"
                }));
                setMeds(migrated);
            } catch (e) { console.error("Meds parse error", e); }
        }

        // 2. Load Today's Log (Handle Migration)
        loadDailyLog(today).then(log => {
            setTodayLog(log);
            setStatsInput(log.vitals); // Prefill inputs
            if (log.habits) {
                setHabitsInput({
                    mealPlan: log.habits.mealPlan || false,
                    activity: log.habits.activity?.toString() || "",
                    hydration: log.habits.hydration?.toString() || ""
                });
            }
        });

        // 3. Load History for Calendar context
        loadHistoryContext();

        // 4. Timer Logic (Fake Call Trigger)
        const interval = setInterval(() => {
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes();
            if (m === 0 && (h === 9 || h === 13 || h === 21)) {
                const activeMedsExist = meds.some(m => !m.status || m.status === 'Active');
                // Only trigger if NOT taken yet today (simple check)
                // Advanced: Check specific slots. MVP: Trigger if *any* meds exist.
                if (activeMedsExist && onTriggerCall) onTriggerCall();
            }
        }, 60000);
        return () => clearInterval(interval);

    }, [meds.length]); // Re-load if meds list changes length/init

    // --- LOGIC: DATA IO ---

    const getLogKey = (date: string) => `yukti_daily_log_${date}`;
    // Legacy Key: `yukti_med_log_${date}` -> { name: true }

    const loadDailyLog = async (date: string): Promise<DailyLog> => {
        const key = getLogKey(date);
        const legacyKey = `yukti_med_log_${date}`;

        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }

        // MIGRATION: Check legacy
        const legacy = localStorage.getItem(legacyKey);
        if (legacy) {
            const parsed = JSON.parse(legacy);
            // key:value -> name:true
            const takenNames = Object.keys(parsed).filter(k => parsed[k] === true);
            const newLog: DailyLog = { meds: takenNames, vitals: {} };
            // Save migrated format immediately? Optional. Let's return it.
            return newLog;
        }

        return { meds: [], vitals: {} };
    };

    const loadHistoryContext = () => {
        // Load all logs for keys starting with prefix (naive but works for MVP localstorage)
        const cache: Record<string, DailyLog> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith("yukti_daily_log_")) {
                const date = key.replace("yukti_daily_log_", "");
                try {
                    cache[date] = JSON.parse(localStorage.getItem(key) || "{}");
                } catch (e) { }
            } else if (key?.startsWith("yukti_med_log_")) {
                // Legacy
                const date = key.replace("yukti_med_log_", "");
                if (!cache[date]) { // Don't overwrite if new format exists
                    try {
                        const parsed = JSON.parse(localStorage.getItem(key) || "{}");
                        cache[date] = { meds: Object.keys(parsed).filter(k => parsed[k]), vitals: {} };
                    } catch (e) { }
                }
            }
        }
        setHistoryData(cache);
    };

    const saveLog = (date: string, log: DailyLog) => {
        localStorage.setItem(getLogKey(date), JSON.stringify(log));
        // Update state cache
        setHistoryData(prev => ({ ...prev, [date]: log }));
        if (date === todayKey) setTodayLog(log);
    };

    // --- LOGIC: ACTIONS ---

    const toggleMed = (medName: string) => {
        const isTaken = todayLog.meds.includes(medName);
        let newMedsList;
        if (isTaken) {
            newMedsList = todayLog.meds.filter(m => m !== medName);
        } else {
            newMedsList = [...todayLog.meds, medName];
        }
        const newLog = { ...todayLog, meds: newMedsList };
        saveLog(todayKey, newLog);
    };

    const saveVitalsAndHabits = () => {
        const newLog = {
            ...todayLog,
            vitals: statsInput,
            habits: {
                mealPlan: habitsInput.mealPlan,
                activity: Number(habitsInput.activity),
                hydration: Number(habitsInput.hydration)
            }
        };
        saveLog(todayKey, newLog);
        alert("Wellness Log Updated! ✅");
    };

    const saveMedsList = (newMeds: Medication[]) => {
        setMeds(newMeds);
        localStorage.setItem("yukti_active_meds", JSON.stringify(newMeds));
    };

    const archiveMed = (med: Medication) => {
        if (confirm("Stop taking this medicine? It will be moved to history.")) {
            const updated = meds.map(m => m.name === med.name ? { ...m, status: "Archived" as const } : m);
            saveMedsList(updated);
        }
    };

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

        // Auto-generate "Timing" string if empty, for backward compatibility display
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
        // Empty slots
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const log = historyData[dateStr];
            const isToday = dateStr === todayKey;
            const isSelected = dateStr === selectedDate;

            // Scoring
            let statusParams = "bg-slate-50 text-slate-400"; // Default (Future/No Data)
            let dotColor = null;

            // Only score PAST or TODAY
            if (new Date(dateStr) <= new Date()) {
                const activeMedsCount = meds.filter(m => m.status === 'Active' || !m.status).length; // Estimate denominator
                if (log) {
                    const takenCount = log.meds.length;
                    const hasVitals = Object.keys(log.vitals || {}).length > 0;

                    if (takenCount >= activeMedsCount && activeMedsCount > 0) {
                        statusParams = "bg-emerald-100 text-emerald-700 font-bold border-emerald-200"; // Perfect
                    } else if (takenCount > 0) {
                        statusParams = "bg-orange-100 text-orange-700 font-bold border-orange-200"; // Partial
                    } else {
                        statusParams = "bg-red-50 text-red-400 border-red-100"; // Missed
                    }

                    if (hasVitals) dotColor = "bg-blue-500";
                } else if (dateStr !== todayKey) {
                    // No log in past -> Assuming missed? Or just grey
                    statusParams = "bg-slate-100 text-slate-400";
                }
            }

            days.push(
                <button
                    key={d}
                    onClick={() => { setSelectedDate(dateStr); }}
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
                <div className="flex gap-4 justify-center mt-4 text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Perfect</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> Partial</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Vitals Logged</span>
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---
    const activeMeds = meds.filter(m => !m.status || m.status === 'Active');
    const archivedMeds = meds.filter(m => m.status === 'Archived');

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* TABS HEADER */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-100/50 p-1.5 rounded-2xl">
                <div className="flex gap-1 w-full md:w-auto">
                    {[
                        { id: "today", label: "Today's Care", icon: Check },
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

                {/* Test Call (Discrete) */}
                <button onClick={onTriggerCall} className="flex text-xs text-slate-400 hover:text-orange-600 gap-1 items-center px-3 border border-slate-200/50 rounded-lg py-1 md:border-none md:p-0">
                    <Clock size={12} /> <span className="hidden md:inline">Test Reminder</span><span className="md:hidden">Test Call</span>
                </button>
            </div>

            {/* --- TAB 1: TODAY'S CARE --- */}
            {activeTab === "today" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* LEFT: Meds Checklist (7 cols) */}
                    <div className="md:col-span-7 space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Pill size={18} className="text-orange-500" /> Daily Medicines
                            </h3>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                                {todayLog.meds.length} / {activeMeds.length} Taken
                            </span>
                        </div>

                        {activeMeds.length === 0 ? (
                            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                                No active medicines. Go to "Manage" to add or restore.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {activeMeds.map((med, idx) => {
                                    const isTaken = todayLog.meds.includes(med.name);
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
                                                        {med.relationToFood && <span className="bg-orange-50 text-orange-700 px-1.5 rounded text-[10px]">{med.relationToFood}</span>}
                                                    </div>
                                                    {med.remarks && <p className="text-[10px] text-slate-400 mt-0.5 italic">"{med.remarks}"</p>}
                                                </div>
                                            </div>
                                            {med.type === "Acute" && (
                                                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                                                    Acute
                                                </span>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Vitals & Habits (5 cols) */}
                    <div className="md:col-span-5 space-y-6">

                        {/* 1. VITALS CARD */}
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 relative">
                            <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4">
                                <Activity size={18} className="text-blue-600" /> Log Vitals
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1 block">Blood Pressure (Sys/Dia)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Heart size={14} className="absolute left-3 top-3 text-slate-400" />
                                            <input
                                                type="number"
                                                placeholder="120"
                                                value={statsInput.bpSys || ""}
                                                onChange={e => setStatsInput({ ...statsInput, bpSys: Number(e.target.value) })}
                                                className="w-full pl-9 pr-2 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-semibold text-slate-700"
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
                                        <div className="relative">
                                            <Droplet size={14} className="absolute left-3 top-3 text-slate-400" />
                                            <input
                                                type="number"
                                                placeholder="100"
                                                value={statsInput.sugar || ""}
                                                onChange={e => setStatsInput({ ...statsInput, sugar: Number(e.target.value) })}
                                                className="w-full pl-9 pr-2 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-semibold text-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1 block">Weight</label>
                                        <div className="relative">
                                            <Scale size={14} className="absolute left-3 top-3 text-slate-400" />
                                            <input
                                                type="number"
                                                placeholder="65"
                                                value={statsInput.weight || ""}
                                                onChange={e => setStatsInput({ ...statsInput, weight: Number(e.target.value) })}
                                                className="w-full pl-9 pr-2 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-semibold text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. HABITS CARD */}
                        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 relative">
                            <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4">
                                <Activity size={18} className="text-emerald-600" /> Lifestyle & Habits
                            </h3>

                            <div className="space-y-4">
                                {/* Meal Plan Toggle */}
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

                        {/* SAVE BUTTON */}
                        <button
                            onClick={saveVitalsAndHabits}
                            className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
                        >
                            Save Daily Log
                        </button>
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
                        {selectedDate ? (
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg h-full">
                                <h3 className="text-xl font-bold text-slate-900 mb-1">
                                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-6">Day Summary</p>

                                {/* DATA LOAD */}
                                {(() => {
                                    const log = historyData[selectedDate] || { meds: [], vitals: {} };
                                    const hasData = log.meds.length > 0 || Object.keys(log.vitals || {}).length > 0;
                                    if (!hasData && selectedDate !== todayKey) return <p className="text-slate-400 italic">No data recorded for this day.</p>;

                                    return (
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                                                    <Pill size={16} className="text-orange-500" />
                                                    Medicines ({log.meds.length})
                                                </h4>
                                                {log.meds.length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {log.meds.map((m, i) => (
                                                            <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                                                                <Check size={14} className="text-emerald-500" /> {m}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-orange-400">No medicines logged.</p>
                                                )}
                                            </div>

                                            <div className="border-t border-slate-100 pt-4">
                                                <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                                                    <Activity size={16} className="text-blue-500" />
                                                    Vitals
                                                </h4>
                                                {Object.keys(log.vitals || {}).length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {log.vitals.bpSys && (
                                                            <div className="bg-slate-50 p-2 rounded-lg">
                                                                <p className="text-[10px] text-slate-400 uppercase">BP</p>
                                                                <p className="font-bold text-slate-700">{log.vitals.bpSys}/{log.vitals.bpDia}</p>
                                                            </div>
                                                        )}
                                                        {log.vitals.sugar && (
                                                            <div className="bg-slate-50 p-2 rounded-lg">
                                                                <p className="text-[10px] text-slate-400 uppercase">Sugar</p>
                                                                <p className="font-bold text-slate-700">{log.vitals.sugar} <span className="text-[10px]">mg/dL</span></p>
                                                            </div>
                                                        )}
                                                        {log.vitals.weight && (
                                                            <div className="bg-slate-50 p-2 rounded-lg">
                                                                <p className="text-[10px] text-slate-400 uppercase">Weight</p>
                                                                <p className="font-bold text-slate-700">{log.vitals.weight} <span className="text-[10px]">kg</span></p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-400">No vitals logged.</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 italic">Select a date to view details.</div>
                        )}
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
                                                    <select value={editingMed.type || "Chronic"} onChange={e => setEditingMed({ ...editingMed, type: e.target.value as any })} className="w-full mt-1 p-2 border rounded-lg text-sm">
                                                        <option value="Chronic">Chronic (Long-term)</option>
                                                        <option value="Acute">Acute (Short-term)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Remarks</label>
                                                <input value={editingMed.remarks || ""} onChange={e => setEditingMed({ ...editingMed, remarks: e.target.value })} className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="e.g. Use warm water" />
                                            </div>

                                            <div className="flex gap-2 justify-end pt-2">
                                                <button type="button" onClick={() => setEditingMed(null)} className="px-4 py-2 text-slate-500 text-sm">Cancel</button>
                                                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Save Changes</button>
                                            </div>
                                        </form>
                                    </motion.div>
                                );
                            }

                            return (
                                <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${med.status === 'Archived' ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                            <Pill size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-900">{med.name}</p>
                                                {med.status === 'Archived' && <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold">ARCHIVED</span>}
                                            </div>
                                            <p className="text-xs text-slate-500">{med.dosage} • {med.timing} • {med.type || "Chronic"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {med.status === 'Archived' ? (
                                            <button onClick={() => {
                                                const updated = meds.map(m => m.name === med.name ? { ...m, status: "Active" as const } : m);
                                                saveMedsList(updated);
                                            }} className="text-xs bg-white border px-3 py-1.5 rounded-lg font-medium hover:bg-slate-50">Restore</button>
                                        ) : (
                                            <>
                                                <button onClick={() => setEditingMed(med)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => archiveMed(med)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
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

// Helper for dynamic icon
function pillIcon(count: number) {
    return (props: any) => (
        <div className="relative">
            <Pill {...props} />
            {count > 0 && <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[8px] h-3 w-3 rounded-full flex items-center justify-center">{count}</span>}
        </div>
    );
}
