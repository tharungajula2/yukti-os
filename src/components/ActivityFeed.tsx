"use client";

import { motion } from "framer-motion";
import { User, Sparkles, Activity, Truck, ChevronRight } from "lucide-react";

const ACTIVITIES = [
    {
        id: 1,
        time: "Today, 9:30 AM",
        author: "Dr. Aruna Desai",
        role: "Geriatrician",
        action: "updated the Diabetes Care Plan.",
        detail: "Dosage adjusted: Glycomet 500mg -> 850mg.",
        icon: User,
        color: "bg-blue-100 text-blue-600",
        isImportant: true
    },
    {
        id: 2,
        time: "Today, 8:15 AM",
        author: "Yukti AI",
        role: "System Monitor",
        action: "flagged a potential drug interaction.",
        detail: "Low Severity: Aspirin + Garlic Supplements.",
        icon: Sparkles,
        color: "bg-orange-100 text-orange-600",
        isImportant: false
    },
    {
        id: 3,
        time: "Yesterday, 6:00 PM",
        author: "Coach Vikram",
        role: "Physio",
        action: "assigned a new exercise.",
        detail: "Added: Seated Knee Extensions (Set of 10).",
        icon: Activity,
        color: "bg-red-100 text-red-600",
        isImportant: false
    },
    {
        id: 4,
        time: "Yesterday, 2:00 PM",
        author: "Amit",
        role: "Care Manager",
        action: "ordered monthly refill.",
        detail: "Glycomet & Atorvastatin (30 Day Supply).",
        icon: Truck,
        color: "bg-slate-100 text-slate-600",
        isImportant: false
    }
];

export function ActivityFeed() {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg">Care Team Updates</h3>
                <button className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1">
                    View All <ChevronRight size={14} />
                </button>
            </div>

            <div className="space-y-6 relative flex-1">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 z-0"></div>

                {ACTIVITIES.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative z-10 flex gap-4"
                    >
                        {/* Icon */}
                        <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${item.color}`}>
                            <item.icon size={18} />
                        </div>

                        {/* Content */}
                        <div className="pt-1 pb-2">
                            <p className="text-xs text-slate-400 font-medium mb-0.5">{item.time}</p>
                            <p className="text-sm text-slate-800 leading-tight">
                                <span className="font-bold">{item.author}</span> {item.action}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">
                                {item.detail}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
