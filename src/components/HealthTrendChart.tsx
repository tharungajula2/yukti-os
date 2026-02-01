"use client";

import { motion } from "framer-motion";
import { TrendingDown, Info } from "lucide-react";

export function HealthTrendChart() {
    const data = [
        { month: "Oct '25", value: 10.7, status: "Critical" },
        { month: "Nov '25", value: 8.5, status: "Warning" },
        { month: "Dec '25", value: 7.2, status: "Good" },
    ];

    // Simple helpers for scaling (assuming range 6.0 to 12.0)
    const MAX = 12.0;
    const MIN = 6.0;
    const RANGE = MAX - MIN;
    const getHeight = (val: number) => {
        return ((val - MIN) / RANGE) * 100;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        Diabetic Control Trajectory (HbA1c)
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">
                            Target Reached! 🎉
                        </span>
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                        Great job, Chaaya! Your blood sugar has dropped by <span className="text-emerald-600 font-bold">3.5 points</span> in 3 months.
                    </p>
                </div>
                <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <TrendingDown size={18} />
                    -32% Improvement
                </div>
            </div>

            {/* CHART AREA */}
            <div className="relative h-64 w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-6 flex items-end justify-between px-12 md:px-24">

                {/* Background Grid Lines */}
                <div className="absolute inset-0 p-6 pointer-events-none flex flex-col justify-between">
                    {[12, 10, 8, 6].map((line, i) => (
                        <div key={i} className="w-full border-t border-slate-200/60 h-0 relative">
                            <span className="absolute -left-6 -top-2 text-[10px] text-slate-400 font-mono">{line}%</span>
                        </div>
                    ))}
                </div>

                {/* Data Points */}
                {data.map((item, idx) => {
                    const heightPercent = getHeight(item.value);
                    const colorClass = idx === 0 ? "bg-red-500 shadow-red-200" : idx === 1 ? "bg-amber-400 shadow-amber-200" : "bg-emerald-500 shadow-emerald-200";
                    const textClass = idx === 0 ? "text-red-600" : idx === 1 ? "text-amber-600" : "text-emerald-600";

                    return (
                        <div key={idx} className="relative flex flex-col items-center justify-end h-full z-10 group w-12">
                            {/* Connector Line (SVG would be ideal, but absolute positioning works for simple 3 points) */}

                            {/* Bar/Point */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercent}%` }}
                                transition={{ duration: 1, delay: idx * 0.3 }}
                                className="w-2 bg-slate-200 rounded-t-full relative flex items-start justify-center"
                            >
                                {/* Dot */}
                                <div className={`absolute -top-3 w-6 h-6 rounded-full border-4 border-white shadow-lg ${colorClass} transition-transform group-hover:scale-125`} />

                                {/* Tooltip */}
                                <div className="absolute -top-12 bg-white px-2 py-1 rounded shadow-md border border-slate-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.value}%
                                </div>
                            </motion.div>

                            {/* Label */}
                            <div className="absolute -bottom-8 text-center">
                                <span className={`text-lg font-bold block ${textClass}`}>{item.value}%</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">{item.month}</span>
                            </div>
                        </div>
                    )
                })}

                {/* SVG Line Overlay (simplified for these fixed points) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none p-6 px-12 md:px-24" style={{ overflow: 'visible' }}>
                    {/* We won't draw a perfect line dynamically without exact pixel widths, but the dots convey the trend enough for this demo. */}
                    {/* If needed we can add a simple path if we knew container width, but CSS flex spacing is variable. */}
                    {/* Visualizing specific trend line via CSS gradients or just the dots is often enough for "Clean UI" */}
                </svg>

            </div>

            <div className="mt-8 flex gap-4 text-xs text-slate-400 justify-center">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Target Range (Below 7.5%)</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Pre-Diabetic</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Diabetic Risk</span>
            </div>
        </motion.div>
    );
}
