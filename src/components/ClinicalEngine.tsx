"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Brain, Heart, Wind, Zap, Bone, Utensils, Moon, Smile, Shield, AlertTriangle, CheckCircle, ClipboardList, RotateCcw } from "lucide-react";

// --- Data Structure (Exact Dictionary) ---
const QUESTIONS = [
    { id: "q1", text: "How old is the member?", options: [{ label: "Below 40", score: 0 }, { label: "40-55", score: 5 }, { label: "56-69", score: 10 }, { label: "70+", score: 15 }, { label: "Don’t Know", score: 5 }] },
    { id: "q2", text: "Have they been told they have high blood sugar, prediabetes, or diabetes?", options: [{ label: "No", score: 0 }, { label: "Prediabetes", score: 5 }, { label: "Diabetes", score: 15 }, { label: "Don't Know", score: 5 }] },
    { id: "q3", text: "Do they have high BP, Disturbed Cholesterol, or heart issues (stent, bypass, angina)?", options: [{ label: "No", score: 0 }, { label: "One Condition", score: 5 }, { label: "Multiple/Severe", score: 15 }, { label: "Don't Know", score: 5 }] },
    { id: "q4", text: "Do they get tired or breathless doing everyday activities?", options: [{ label: "Never", score: 0 }, { label: "Sometimes", score: 5 }, { label: "Often", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q5", text: "Have they had stroke, tremors (parkinsonism), limb weakness, or slowed movements?", options: [{ label: "No", score: 0 }, { label: "Mild signs", score: 5 }, { label: "Diagnosed/Visible", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q6", text: "Do they often seem confused, forgetful, or unsteady?", options: [{ label: "No", score: 0 }, { label: "Sometimes", score: 5 }, { label: "Often", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q7", text: "Have they been hospitalized or undergone major surgery (heart, brain, spine) or cancer?", options: [{ label: "No", score: 0 }, { label: "Once/Minor", score: 5 }, { label: "Multiple/Major/Cancer", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q8", text: "Do they complain of joint/back/knee pain that limits movement?", options: [{ label: "No", score: 0 }, { label: "Sometimes/Mild", score: 10 }, { label: "Severe/Daily", score: 20 }, { label: "Don't Know", score: 5 }] },
    { id: "q9", text: "Have they had falls or fractures in the last 2 years?", options: [{ label: "No", score: 0 }, { label: "Once", score: 5 }, { label: "Multiple", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q10", text: "Do they need help with stairs, bathing, dressing or getting off the floor?", options: [{ label: "No", score: 0 }, { label: "Occasionally", score: 5 }, { label: "Often", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q11", text: "Do they complain of bloating, acidity, constipation, or gut issues?", options: [{ label: "No", score: 0 }, { label: "Occasionally", score: 5 }, { label: "Frequently", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q12", text: "Do they often seem stressed, anxious, or emotionally low?", options: [{ label: "No", score: 0 }, { label: "Sometimes", score: 5 }, { label: "Often", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q13", text: "Do they sleep poorly, snore loudly or nap excessively?", options: [{ label: "Good/No", score: 0 }, { label: "Sometimes", score: 5 }, { label: "Often/Poor", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q14", text: "Do they usually eat unhealthy foods, eat at odd times, or drink too little water?", options: [{ label: "No", score: 0 }, { label: "Sometimes", score: 5 }, { label: "Often", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q15", text: "Do they smoke, drink often or avoid exercise completely?", options: [{ label: "None", score: 0 }, { label: "One habit", score: 5 }, { label: "Two or more", score: 10 }, { label: "Don't Know", score: 5 }] },
];

export function ClinicalEngine() {
    // Lazy init to avoid race conditions
    const [answers, setAnswers] = useState<Record<string, string>>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("yukti_assessment_data_v2");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return parsed.answers || {};
                } catch (e) {
                    console.error("Error loading saved data", e);
                }
            }
        }
        return {};
    });



    // --- Scoring Logic (useMemo) ---
    const scores = useMemo(() => {
        // Helper to find score by label
        const getScore = (qId: string) => {
            const selectedLabel = answers[qId];
            if (!selectedLabel) return 0;
            const question = QUESTIONS.find(q => q.id === qId);
            const option = question?.options.find(opt => opt.label === selectedLabel);
            return option?.score || 0;
        };

        const categories = [
            { name: "Metabolic", score: getScore("q2"), max: 15, icon: Zap, color: "text-yellow-600 bg-yellow-100" },
            { name: "Cardiovascular", score: getScore("q3"), max: 15, icon: Heart, color: "text-red-600 bg-red-100" },
            { name: "Cognitive", score: getScore("q5") + getScore("q6"), max: 20, icon: Brain, color: "text-purple-600 bg-purple-100" },
            { name: "Muscular", score: getScore("q8"), max: 20, icon: Bone, color: "text-stone-600 bg-stone-100" },
            { name: "Frailty", score: getScore("q9") + getScore("q10"), max: 20, icon: Activity, color: "text-orange-600 bg-orange-100" },
            { name: "Digestive", score: getScore("q11"), max: 10, icon: Utensils, color: "text-emerald-600 bg-emerald-100" },
            { name: "Emotional", score: getScore("q12"), max: 10, icon: Smile, color: "text-sky-600 bg-sky-100" },
            { name: "Sleep", score: getScore("q13"), max: 10, icon: Moon, color: "text-indigo-600 bg-indigo-100" },
            { name: "Lifestyle", score: getScore("q14") + getScore("q15"), max: 20, icon: Wind, color: "text-green-600 bg-green-100" },
            { name: "Resilience", score: getScore("q1") + getScore("q4") + getScore("q7"), max: 35, icon: Shield, color: "text-blue-600 bg-blue-100" },
        ];

        const total = categories.reduce((sum, cat) => sum + cat.score, 0);

        // Risk Logic: 0-20 Green, 21-40 Yellow, 41+ Red
        let riskLevel = "Healthy Baseline";
        let riskColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
        let riskIcon = CheckCircle;

        if (total > 40) {
            riskLevel = "High Risk: Immediate Action Required";
            riskColor = "bg-red-50 text-red-700 border-red-200";
            riskIcon = AlertTriangle;
        } else if (total > 20) {
            riskLevel = "Moderate Attention";
            riskColor = "bg-amber-50 text-amber-700 border-amber-200";
            riskIcon = AlertTriangle;
        }

        return { categories, total, riskLevel, riskColor, RiskIcon: riskIcon };
    }, [answers]);

    // Save to LocalStorage on change


    // Save to LocalStorage on change
    useEffect(() => {
        localStorage.setItem("yukti_assessment_data_v2", JSON.stringify({ answers, scores }));
    }, [answers, scores]);


    const handleSelect = (id: string, label: string) => {
        setAnswers((prev) => ({ ...prev, [id]: label }));
    };

    const handleReset = () => {
        if (confirm("Are you sure? This will clear your health profile and lock Smart Reports.")) {
            localStorage.removeItem("yukti_assessment_data_v2");
            setAnswers({}); // Clear state to reset UI
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-8rem)] gap-8 overflow-y-auto md:overflow-hidden pb-20 md:pb-0">
            {/* Left Panel: Questions */}
            <div className="w-full md:w-1/2 flex-1 overflow-y-auto pr-1 md:pr-4 custom-scrollbar pb-32 md:pb-20">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Health Assessment</h2>
                        <p className="text-sm text-slate-600">Complete this 15-point check for a holistic health profile.</p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
                    >
                        <RotateCcw size={14} />
                        Reset Profile
                    </button>
                </div>

                <div className="space-y-6">
                    {QUESTIONS.map((q, idx) => (
                        <div key={q.id} className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 backdrop-blur-sm transition-all hover:bg-white/80">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                                    {idx + 1}
                                </span>
                                <h3 className="text-lg font-medium text-slate-900">{q.text}</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {q.options.map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleSelect(q.id, opt.label)}
                                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${answers[q.id] === opt.label
                                            ? "bg-orange-600 text-white shadow-lg"
                                            : "bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Live Report Dashboard */}
            <div className="w-full md:w-1/2 md:max-w-md shrink-0">
                <div className="sticky top-0 h-auto md:h-full overflow-y-auto rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-md border border-slate-200/60 custom-scrollbar flex flex-col">
                    <div className="mb-6 text-center">
                        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Health Assessment Score</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-6xl font-bold text-slate-900">{scores.total}</span>
                            <span className="text-xl text-slate-400 font-medium self-end mb-2">/ 175</span>
                        </div>
                    </div>

                    {/* Risk Banner */}
                    <div className={`mb-6 rounded-xl border p-4 flex items-start gap-3 ${scores.riskColor}`}>
                        <scores.RiskIcon size={24} className="shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wide">{scores.riskLevel}</h4>
                            <p className="text-sm mt-1 opacity-90">Based on the 15-point clinical protocol.</p>
                        </div>
                    </div>

                    <div className="space-y-3 flex-1">
                        {scores.categories.map((cat) => (
                            <div key={cat.name} className="flex items-center gap-4">
                                <div className={`flex h-8 w-8 min-w-[2rem] items-center justify-center rounded-lg ${cat.color}`}>
                                    <cat.icon size={16} />
                                </div>
                                <div className="flex-1">
                                    <div className="mb-1 flex justify-between text-xs">
                                        <span className="font-medium text-slate-700">{cat.name}</span>
                                        <span className="text-slate-500">{cat.score}</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((cat.score / cat.max) * 100, 100)}%` }}
                                            transition={{ duration: 0.5 }}
                                            className={`h-full rounded-full ${cat.score > 0 ? "bg-orange-500" : "bg-slate-300"}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 space-y-4 pt-6 border-t border-slate-200">


                        <div className="bg-slate-900 rounded-xl p-4 text-white">
                            <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-400 mb-1">Recommended Plan</h4>
                            <p className="font-medium">Specialist-Supervised, Multidisciplinary Care</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
