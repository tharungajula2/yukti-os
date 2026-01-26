"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, User, Settings, LogOut, CheckCheck, AlertTriangle, Pill, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HeaderIcons() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const [userName, setUserName] = useState("User");

    // Load User Name for Profile
    useEffect(() => {
        if (typeof window !== "undefined") {
            setUserName(localStorage.getItem("yukti_user_name") || "User");
        }
    }, []);

    // Close dropdowns when clicking outside
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfile(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = () => {
        if (confirm("Are you sure you want to sign out?")) {
            // Clear IDENTITY only, keeps data for next demo load technically, 
            // but enables "Login" screen to appear.
            localStorage.removeItem("yukti_auth_v2");
            window.location.reload();
        }
    };

    const notifications = [
        {
            id: 1,
            icon: <Pill size={16} className="text-blue-600" />,
            bg: "bg-blue-50",
            title: "Medicine Reminder",
            desc: "Levolin Rotacaps due at 9:00 PM.",
            time: "10m ago"
        },
        {
            id: 2,
            icon: <Activity size={16} className="text-red-600" />,
            bg: "bg-red-50",
            title: "Health Alert",
            desc: "Assessment indicates High Metabolic Risk.",
            time: "2h ago"
        },
        {
            id: 3,
            icon: <User size={16} className="text-emerald-600" />,
            bg: "bg-emerald-50",
            title: "Dr. Aruna",
            desc: "Updated your Care Plan.",
            time: "1d ago"
        }
    ];

    return (
        <div className="flex items-center gap-4 relative z-50">

            {/* --- NOTIFICATIONS --- */}
            <div className="relative" ref={notifRef}>
                <button
                    onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors relative"
                >
                    <Bell size={20} />
                    {hasUnread && (
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                </button>

                <AnimatePresence>
                    {showNotifications && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden origin-top-right"
                        >
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                {hasUnread && (
                                    <button
                                        onClick={() => setHasUnread(false)}
                                        className="text-xs text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1"
                                    >
                                        <CheckCheck size={12} /> Mark read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.map((n) => (
                                    <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3">
                                        <div className={`h-8 w-8 rounded-full ${n.bg} flex items-center justify-center shrink-0`}>
                                            {n.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-800">{n.title}</h4>
                                            <p className="text-xs text-slate-500 leading-snug mt-0.5">{n.desc}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-2 text-center bg-slate-50">
                                <button className="text-xs font-semibold text-slate-500 hover:text-slate-800">View All</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- PROFILE --- */}
            <div className="relative" ref={profileRef}>
                <button
                    onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                    className="h-10 w-10 overflow-hidden rounded-full bg-orange-100 border border-orange-200 hover:ring-2 hover:ring-orange-100 transition-all flex items-center justify-center"
                >
                    <span className="text-orange-700 font-bold">{userName.charAt(0).toUpperCase()}</span>
                </button>

                <AnimatePresence>
                    {showProfile && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden origin-top-right"
                        >
                            <div className="p-5 bg-gradient-to-br from-orange-50 to-white border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold shadow-inner">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{userName}</h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {localStorage.getItem('yukti_user_age') ? `${localStorage.getItem('yukti_user_age')} • ${localStorage.getItem('yukti_user_gender')}` : 'Patient Account'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => alert("Settings are locked in this Demo.")}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                                >
                                    <Settings size={16} /> Settings
                                </button>

                                <div className="h-px bg-slate-100 my-1 mx-2"></div>

                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
