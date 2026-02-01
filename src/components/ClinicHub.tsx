"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Video, MapPin, CheckCircle, CreditCard, Wallet, FileText, Plus, ShieldCheck, ChevronRight, X, User, Clock } from "lucide-react";
import { useToast } from "./ui/Toast";

interface Appointment {
    id: string;
    date: string; // "Feb 10"
    time: string; // "10:00 AM"
    doctor: string;
    type: string;
    status: "Confirmed" | "Completed" | "Pending";
    isPast?: boolean;
}

const DEFAULT_APPOINTMENTS: Appointment[] = [
    {
        id: "1",
        date: "Feb 10",
        time: "10:00 AM",
        doctor: "Dr. Aruna Desai",
        type: "Geriatric Review • Video Consultation",
        status: "Confirmed",
        isPast: false
    },
    {
        id: "2",
        date: "Jan 12",
        time: "09:00 AM",
        doctor: "Annual Lab Panel",
        type: "Home Collection • Thyrocare",
        status: "Completed",
        isPast: true
    }
];

export function ClinicHub() {
    const { showToast } = useToast();

    // --- STATE ---
    const [balance, setBalance] = useState(1250);
    const [appointments, setAppointments] = useState<Appointment[]>(DEFAULT_APPOINTMENTS);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Form State
    const [bookForm, setBookForm] = useState({
        specialist: "Dr. Aruna Desai",
        date: "",
        time: ""
    });

    // --- ACTIONS ---

    const handleTopUp = () => {
        showToast("Processing Secure Payment...", "info");
        setTimeout(() => {
            setBalance(prev => prev + 1000);
            showToast("₹1,000 added to Praan Wallet successfully!", "success");
        }, 1500);
    };

    const handleBookAppointment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!bookForm.date || !bookForm.time) {
            showToast("Please select valid date and time", "error");
            return;
        }

        // Parse date for display (Simplified logic for demo)
        const dateObj = new Date(bookForm.date);
        const month = dateObj.toLocaleString('default', { month: 'short' });
        const day = dateObj.getDate();
        const dateStr = `${month} ${day}`;

        const newAppt: Appointment = {
            id: Date.now().toString(),
            date: dateStr,
            time: bookForm.time,
            doctor: bookForm.specialist,
            type: "Video Consultation",
            status: "Confirmed",
            isPast: false
        };

        // Optimistic UI Update: Add to top
        setAppointments(prev => [newAppt, ...prev]);
        setShowBookingModal(false);
        showToast("Appointment Confirmed! Dr. Desai notified.", "success");

        // Reset Form
        setBookForm({ specialist: "Dr. Aruna Desai", date: "", time: "" });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 relative">
            {/* HEADER */}
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Clinic Hub</h2>
                <p className="text-slate-500 mt-2 text-sm md:text-lg">Manage appointments, insurance, and billing in one place.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: UPCOMING VISITS (Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            <Calendar className="text-orange-600" size={20} /> Your Schedule
                        </h3>
                        <button
                            onClick={() => setShowBookingModal(true)}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                        >
                            <Plus size={16} /> Book New
                        </button>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {appointments.map((appt) => (
                                <motion.div
                                    key={appt.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`p-6 rounded-3xl border transition-all relative overflow-hidden ${appt.isPast
                                        ? "bg-slate-50 border-slate-200 opacity-80"
                                        : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                                        }`}
                                >
                                    {/* Status Badge (Only for active) */}
                                    {!appt.isPast && (
                                        <div className="absolute top-0 right-0 p-4">
                                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {appt.status}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                                        {/* Date Box */}
                                        <div className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center w-full md:w-24 shrink-0 border ${appt.isPast ? "bg-slate-200 text-slate-500" : "bg-orange-50 border-orange-100"
                                            }`}>
                                            <span className={`text-xs font-bold uppercase ${appt.isPast ? "" : "text-orange-400"}`}>{appt.date.split(' ')[0]}</span>
                                            <span className={`text-2xl font-bold ${appt.isPast ? "text-slate-600" : "text-slate-900"}`}>{appt.date.split(' ')[1]}</span>
                                            {!appt.isPast && <span className="text-xs font-medium text-slate-500">{appt.time}</span>}
                                        </div>

                                        <div className="flex-1 w-full text-center md:text-left">
                                            <div className="flex flex-col md:flex-row justify-between items-start">
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-900">{appt.doctor}</h4>
                                                    <p className="text-sm text-slate-500 font-medium mb-4">{appt.type}</p>
                                                </div>
                                                {appt.isPast && (
                                                    <span className="flex items-center gap-1 text-slate-500 text-xs font-bold uppercase bg-slate-200/50 px-2 py-1 rounded self-center md:self-start mb-2 md:mb-0">
                                                        <CheckCircle size={12} /> Completed
                                                    </span>
                                                )}
                                            </div>

                                            {!appt.isPast && (
                                                <div className="flex flex-col md:flex-row gap-3 mt-2">
                                                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-200 active:scale-95">
                                                        <Video size={16} /> Join Call
                                                    </button>
                                                    <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
                                                        Reschedule
                                                    </button>
                                                </div>
                                            )}
                                            {appt.isPast && (
                                                <button className="text-orange-600 text-sm font-bold hover:underline">View Report</button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT COLUMN: FINANCE (Span 1) */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <Wallet className="text-orange-600" size={20} /> Health Finance
                    </h3>

                    {/* WALLET CARD */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShieldCheck size={120} />
                        </div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Insurance Policy</p>
                                <h4 className="font-bold text-lg flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-400" /> Yukti Senior Shield
                                </h4>
                            </div>
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-500/30">
                                ACTIVE
                            </span>
                        </div>

                        <div className="space-y-1 relative z-10 mb-6">
                            <p className="text-slate-400 text-xs font-bold uppercase">Policy Number</p>
                            <p className="font-mono text-xl tracking-widest text-slate-200">PR-8829-X</p>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex justify-between items-end relative z-10">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Wallet Balance</p>
                                <AnimatePresence mode="popLayout">
                                    <motion.p
                                        key={balance}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-2xl font-bold"
                                    >
                                        ₹ {balance.toLocaleString()}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                            <button
                                onClick={handleTopUp}
                                className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 active:scale-95 transition-all"
                            >
                                Top Up
                            </button>
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                        <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText size={18} />
                                </div>
                                <span className="font-semibold text-slate-700">View Claims History</span>
                            </div>
                            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <CreditCard size={18} />
                                </div>
                                <span className="font-semibold text-slate-700">Manage Payment Methods</span>
                            </div>
                            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>

            {/* BOOKING MODAL */}
            <AnimatePresence>
                {showBookingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowBookingModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                <X size={20} className="text-slate-600" />
                            </button>

                            <h3 className="text-xl font-bold text-slate-900 mb-1">Book Appointment</h3>
                            <p className="text-sm text-slate-500 mb-6">Schedule a visit or video consultation.</p>

                            <form onSubmit={handleBookAppointment} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                                        <User size={12} /> Specialist
                                    </label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
                                        value={bookForm.specialist}
                                        onChange={(e) => setBookForm({ ...bookForm, specialist: e.target.value })}
                                    >
                                        <option value="Dr. Aruna Desai">Dr. Aruna Desai (Geriatric)</option>
                                        <option value="Dr. Esha Solanki">Dr. Esha Solanki (Cardio)</option>
                                        <option value="Coach Vikram">Coach Vikram (Physio)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                                            <Calendar size={12} /> Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm"
                                            value={bookForm.date}
                                            onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                                            <Clock size={12} /> Time
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm"
                                            value={bookForm.time}
                                            onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

