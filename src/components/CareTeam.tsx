"use client";

import { motion } from "framer-motion";
import { Sparkles, Stethoscope, Phone, ArrowRight, Activity, Utensils } from "lucide-react";
import { useState } from "react";

export function CareTeam() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* HEADER */}
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Your Care Squad</h2>
                <p className="text-slate-500 mt-2 text-sm md:text-lg">Specialist-supervised, AI-monitored protection.</p>
            </div>

            {/* 5-MEMBER GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. YUKTI AI */}
                <TeamCard
                    icon={<Sparkles size={32} />}
                    iconColor="bg-orange-100 text-orange-600"
                    name="Yukti AI"
                    role="24/7 Vitals Monitor"
                    status={
                        <span className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Online
                        </span>
                    }
                    bio="Continuously analyzing your vitals and reports to detect risks early."
                    actionLabel="View Reports"
                    onAction={() => document.getElementById("nav-smart-reports")?.click()}
                    isAI
                />

                {/* 2. DR. ARUNA DESAI */}
                <TeamCard
                    icon={<Stethoscope size={32} />}
                    iconColor="bg-blue-100 text-blue-600"
                    name="Dr. Aruna Desai"
                    role="Senior Geriatrician"
                    status={<span className="text-slate-500 text-xs font-semibold">Medical Oversight</span>}
                    bio="20+ years in Elderly Care. Leads your monthly health review."
                    actionLabel="Request Consult"
                    onAction={() => alert("Request sent to Dr. Aruna. Clinic will confirm slot.")}
                />

                {/* 3. MS. SANYA KAPOOR */}
                <TeamCard
                    icon={<Utensils size={32} />}
                    iconColor="bg-green-100 text-green-600"
                    name="Ms. Sanya Kapoor"
                    role="Clinical Nutritionist"
                    status={<span className="text-slate-500 text-xs font-semibold">Diet & Gut Health</span>}
                    bio="Specialist in diabetic-friendly meal plans and gut health."
                    actionLabel="Request Plan Change"
                    onAction={() => alert("Request sent to Sanya. She will review your current plan.")}
                />

                {/* 4. COACH VIKRAM SINGH */}
                <TeamCard
                    icon={<Activity size={32} />}
                    iconColor="bg-red-100 text-red-600"
                    name="Coach Vikram Singh"
                    role="Mobility Specialist"
                    status={<span className="text-slate-500 text-xs font-semibold">Physio & Fall Prevention</span>}
                    bio="Focuses on balance, strength, and safe movement protocols."
                    actionLabel="View Exercises"
                    onAction={() => alert("Opening Mobility Module... (Coming Soon)")}
                />

                {/* 5. AMIT VERMA */}
                <TeamCard
                    icon={<Phone size={32} />}
                    iconColor="bg-slate-100 text-slate-600"
                    name="Amit Verma"
                    role="Care Manager"
                    status={<span className="text-slate-500 text-xs font-semibold">Logistics & Support</span>}
                    bio="Your point of contact for lab tests, medicines, and logistics."
                    actionLabel="Call Now"
                    onAction={() => alert("Calling Amit Verma...")}
                />

            </div>

            {/* DISCLAIMER FOOTER */}
            <div className="text-center pt-8 border-t border-slate-100">
                <p className="text-slate-400 text-xs">
                    * Care Team members shown above are representative profiles for this demo. Actual care team assignment occurs after patient onboarding.
                </p>
            </div>
        </div>
    );
}

function TeamCard({ icon, iconColor, name, role, status, bio, actionLabel, onAction, isAI = false }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-6 rounded-3xl border border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all flex flex-col h-full ${isAI ? 'ring-1 ring-orange-200 bg-orange-50/30' : ''}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${iconColor}`}>
                    {icon}
                </div>
                <div className="bg-white/50 px-3 py-1.5 rounded-full border border-slate-100 backdrop-blur-md">
                    {status}
                </div>
            </div>

            <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{role}</p>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-1">
                {bio}
            </p>

            <button
                onClick={onAction}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isAI
                    ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-200"
                    : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
            >
                {actionLabel}
                {!isAI && <ArrowRight size={16} className="text-slate-400" />}
            </button>
        </motion.div>
    )
}
