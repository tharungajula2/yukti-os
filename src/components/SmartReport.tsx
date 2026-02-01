"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import { UploadCloud, Loader2, FileText, AlertCircle, Lock, ArrowRight, ShieldCheck, Pill, Brain, Activity, Clock, FileSearch, Trash2, Milestone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HealthTrendChart } from "./HealthTrendChart";

interface SmartReportProps {
    onNavigate?: () => void;
}

export function SmartReport({ onNavigate }: SmartReportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle");
    const [isLocked, setIsLocked] = useState(true);
    const [context, setContext] = useState("");
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"current" | "history">("current");

    // Load Context & History on Mount
    useEffect(() => {
        // 1. Clinical Context (Gate)
        const savedData = localStorage.getItem("yukti_assessment_data_v2");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // STRICT GATE: Only unlock if user has answers ALL 15 questions
                // (Checking for >= 14 just in case they skipped one non-mandatory, but ideally 15)
                // Let's enforce 15 for "Complete Profile"
                if (parsed.answers && Object.keys(parsed.answers).length >= 15) {
                    setIsLocked(false);
                    const contextSummary = `
                Scores: ${JSON.stringify(parsed.scores?.categories)}
                Total Risk: ${parsed.scores?.riskLevel} (${parsed.scores?.total}/175)
                User Answers: ${JSON.stringify(parsed.answers)}
              `;
                    setContext(contextSummary);
                } else {
                    // Data exists but is incomplete
                    setIsLocked(true);
                }
            } catch (e) {
                setContext("Assessment data corrupted.");
                setIsLocked(false);
            }
        } else {
            setIsLocked(true);
        }

        // 2. Report History (Memory)
        const savedHistory = localStorage.getItem("yukti_history");
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) { console.error("History parse error", e); }
        }

        // 3. Holistic Summary Persistence (New)
        const savedSummary = localStorage.getItem("yukti_latest_summary");
        if (savedSummary) {
            try {
                const summaryData = JSON.parse(savedSummary);
                // Only show if no file is currently selected (to avoid confusion)
                setAnalysisData(summaryData);
                setStatus("done");
            } catch (e) { console.error("Summary parse error", e); }
        }
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(selectedFile.type.startsWith('image') ? objectUrl : null);
            setAnalysisData(null);
            setStatus("idle");
            setActiveTab("current");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/png": [],
            "image/jpeg": [],
            "image/jpg": [],
            "application/pdf": [],
        },
        maxFiles: 1,
    });

    const analyzeReport = async () => {
        if (!file) return;

        setStatus("analyzing");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("clinicalContext", context);
            // Send simplified history for context (last 3 summaries to save tokens)
            const historyContext = history.slice(0, 3).map(h => ({ date: h.meta?.reportDate, summary: h.summary, biomarkers: h.biomarkers }));
            formData.append("historyContext", JSON.stringify(historyContext));

            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                const result = data.result;
                setAnalysisData(result);
                setStatus("done");

                // Save to History (Memory)
                const newHistoryItem = { ...result, timestamp: new Date().toISOString() };
                const updatedHistory = [newHistoryItem, ...history];
                setHistory(updatedHistory);
                localStorage.setItem("yukti_history", JSON.stringify(updatedHistory));

                // AUTO-SYNC WORKFLOW: Update Active Meds
                if (result.medicines && result.medicines.length > 0) {
                    // Get existing meds
                    const existingMedsRaw = localStorage.getItem("yukti_active_meds");
                    const existingMeds = existingMedsRaw ? JSON.parse(existingMedsRaw) : [];

                    // Merge new meds (prevent duplicates by name)
                    // Merge new meds (prevent duplicates by name, update details instead)
                    const mergedMeds = [...existingMeds];

                    result.medicines.forEach((newMed: any) => {
                        const existingIndex = mergedMeds.findIndex(m => m.name.toLowerCase() === newMed.name.toLowerCase());

                        // Construct the full med object
                        const medEntry = {
                            ...newMed,
                            status: "Active",
                            startDate: new Date().toISOString().split('T')[0], // Today
                            type: newMed.type || "Chronic" // Default to Chronic if unsure
                        };

                        if (existingIndex !== -1) {
                            // Update existing (Effective "Smart Merge")
                            mergedMeds[existingIndex] = { ...mergedMeds[existingIndex], ...medEntry };
                        } else {
                            // Add new
                            mergedMeds.push(medEntry);
                        }
                    });

                    localStorage.setItem("yukti_active_meds", JSON.stringify(mergedMeds));
                    // Optional: You could trigger a toast here "Meds Updated"
                }

            } else {
                console.error(data.error);
                setAnalysisData({ error: data.details || data.error });
                setStatus("error");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    const deleteHistoryItem = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Remove this report from history?")) {
            const updated = history.filter((_, i) => i !== index);
            setHistory(updated);
            localStorage.setItem("yukti_history", JSON.stringify(updated));
            // If deleting the currently viewed report, clear the view
            if (activeTab === "current" && analysisData === history[index]) {
                setAnalysisData(null);
                setStatus("idle");
            }
        }
    };

    if (isLocked) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="mb-6 h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                    <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Clinical Profile Required</h3>
                <p className="text-slate-600 max-w-md mb-8">
                    To ensure accurate, safe AI analysis, Yukti Needs to know the patient's baseline health first. Please complete the Clinical Assessment.
                </p>
                <button
                    onClick={onNavigate}
                    className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
                >
                    Go to Clinical Engine <ArrowRight size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            <div className="text-center md:text-left flex items-center justify-between">
                <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        Reports & Trends
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Beta</span>
                    </h2>
                    <p className="text-slate-600 mt-1">Context-Aware Medical Document Analysis</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <ShieldCheck size={16} />
                    <span>Memory Active ({history.length} docs)</span>
                </div>
            </div>

            {/* DASHBOARD: TRENDS */}
            <HealthTrendChart />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Upload Section (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-64 relative overflow-hidden ${isDragActive
                            ? "border-orange-500 bg-orange-50"
                            : "border-slate-300 hover:border-orange-400 hover:bg-orange-50/30"
                            } ${file ? "bg-white/60" : ""}`}
                    >
                        <input {...getInputProps()} />
                        {preview ? (
                            <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
                                <img src={preview} alt="Preview" className="max-h-52 rounded-lg object-contain shadow-sm" />
                                <p className="marginTop-2 text-xs text-slate-500 truncate max-w-full px-4">{file?.name}</p>
                            </div>
                        ) : file ? (
                            <div className="flex flex-col items-center z-10">
                                <FileText size={48} className="text-orange-500 mb-3" />
                                <p className="text-slate-900 font-medium">{file.name}</p>
                                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <>
                                <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-slate-900 font-medium">Click to upload or drag & drop</p>
                                <p className="text-sm text-slate-500 mt-1">PDFs or Images (up to 10MB)</p>
                            </>
                        )}
                    </div>

                    {file && status !== "analyzing" && status !== "done" && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={analyzeReport}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Brain size={18} />
                            Run Yukti Analysis
                        </motion.button>
                    )}

                    {status === "analyzing" && (
                        <div className="w-full py-6 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-3 text-center">
                            <Loader2 size={28} className="animate-spin text-orange-600" />
                            <div>
                                <p className="text-slate-900 font-medium">Yukti AI is reading...</p>
                                <p className="text-xs text-slate-500 mt-1">Comparing with {history.length} past reports</p>
                            </div>
                        </div>
                    )}

                    {/* Past Uploads Mini List */}
                    {history.length > 0 && (
                        <div className="bg-white/50 rounded-xl border border-slate-200 p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Clock size={12} /> Recent History
                            </h4>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {history.map((h, i) => (
                                    <div
                                        key={i}
                                        className={`group relative text-xs p-3 rounded-lg border cursor-pointer transition-all ${analysisData === h ? "bg-orange-50 border-orange-200" : "bg-white border-slate-100 hover:border-orange-200"
                                            }`}
                                        onClick={() => {
                                            setAnalysisData(h);
                                            setStatus("done"); // Fix: Ensure status is 'done' so it renders
                                            setActiveTab("current");
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-slate-800">{h.meta?.reportDate || "Undated Report"}</p>
                                                <p className="text-slate-500 truncate">{h.meta?.reportType || h.docType || "Medical Document"}</p>
                                            </div>
                                            <button
                                                onClick={(e) => deleteHistoryItem(i, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                                title="Delete Report"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Left Panel Footer / Summary Action */}
                    <div className="mt-4">
                        <button
                            onClick={async () => {
                                setStatus("analyzing");
                                setActiveTab("current"); // or "summary"
                                try {
                                    const formData = new FormData();
                                    formData.append("mode", "summary");
                                    formData.append("clinicalContext", context);
                                    // Full history for summary
                                    const historyContext = history.map(h => ({ date: h.meta?.reportDate, summary: h.summary, biomarkers: h.biomarkers }));
                                    formData.append("historyContext", JSON.stringify(historyContext));

                                    const response = await fetch("/api/analyze", { method: "POST", body: formData });
                                    const data = await response.json();
                                    if (response.ok) {
                                        setAnalysisData({ ...data.result, isSummary: true });
                                        setStatus("done");
                                        localStorage.setItem("yukti_latest_summary", JSON.stringify({ ...data.result, isSummary: true }));
                                    } else {
                                        setAnalysisData({ error: "Failed to generate summary." });
                                        setStatus("error");
                                    }
                                } catch (e) {
                                    setStatus("error");
                                }
                            }}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            <Brain size={18} />
                            Generate Holistic Summary
                        </button>
                        <p className="text-xs text-center text-slate-400 mt-2">Connects Clinical Profile with all Past Reports</p>
                    </div>
                </div>

                {/* RIGHT: Results Section (8 cols) */}
                <div className="lg:col-span-8 relative min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {status === "done" && analysisData ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-xl h-full flex flex-col overflow-hidden"
                            >
                                {analysisData.isSummary ? (
                                    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-indigo-50 to-white custom-scrollbar">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                                <Brain size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-900">{analysisData.title}</h3>
                                                <div className="text-indigo-600 font-medium prose prose-sm max-w-none prose-p:m-0 prose-strong:text-indigo-800">
                                                    <ReactMarkdown>{analysisData.patientRiskProfile}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm">
                                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Activity size={18} className="text-indigo-500" />
                                                    Health Trajectory
                                                </h4>
                                                <div className="text-slate-700 leading-relaxed text-sm prose prose-sm max-w-none prose-p:m-0 prose-strong:text-indigo-700">
                                                    <ReactMarkdown>{analysisData.trendAnalysis}</ReactMarkdown>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                                                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <FileSearch size={18} className="text-orange-500" />
                                                        Key Findings
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {analysisData.keyFindings?.map((f: string, i: number) => (
                                                            <li key={i} className="flex gap-2 text-sm text-slate-700">
                                                                <ArrowRight size={14} className="mt-1 text-orange-400 shrink-0" />
                                                                <div className="prose prose-sm max-w-none prose-p:m-0 prose-strong:text-slate-900">
                                                                    <ReactMarkdown>{f}</ReactMarkdown>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl">
                                                    <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                                                        <ShieldCheck size={18} className="text-emerald-400" />
                                                        Yukti Recommendation
                                                    </h4>
                                                    <p className="font-medium text-lg text-emerald-50 leading-snug">
                                                        {analysisData.recommendation}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Report Header */}
                                        <div className="p-6 border-b border-slate-100 bg-white/50">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${analysisData.meta?.reportType?.includes('Rx') ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        {analysisData.meta?.reportType || analysisData.docType || "Medical Document"}
                                                    </span>
                                                    <h3 className="text-xl font-bold text-slate-900 mt-2">Analysis Results</h3>
                                                </div>
                                                <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">Y</div>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{analysisData.summary}</p>

                                            {/* Clinical Correlation Badge */}
                                            {analysisData.clinicalCorrelation && (
                                                <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex gap-3">
                                                    <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <h5 className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">Clinical Context Check</h5>
                                                        <div className="text-sm text-slate-700 prose prose-sm max-w-none prose-p:m-0 prose-strong:text-indigo-900">
                                                            <ReactMarkdown>{analysisData.clinicalCorrelation}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Report Content */}
                                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">

                                            {/* 1. Biomarker Table */}
                                            {analysisData.biomarkers && analysisData.biomarkers.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
                                                        <Activity size={18} className="text-emerald-600" /> Biomarker Data
                                                    </h4>
                                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                                        <table className="w-full text-sm text-left">
                                                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                                                <tr>
                                                                    <th className="px-4 py-3">Test Name</th>
                                                                    <th className="px-4 py-3">Result</th>
                                                                    <th className="px-4 py-3">Status</th>
                                                                    <th className="px-4 py-3">Trend</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                                {analysisData.biomarkers.map((b: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                                        <td className="px-4 py-3 font-medium text-slate-900">{b.name}</td>
                                                                        <td className="px-4 py-3 text-slate-600">
                                                                            <span className="font-semibold">{b.value}</span> <span className="text-xs text-slate-400">{b.unit}</span>
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.status?.toLowerCase().includes('high') || b.status?.toLowerCase().includes('low') || b.status?.toLowerCase().includes('abnormal')
                                                                                ? "bg-red-100 text-red-700"
                                                                                : "bg-emerald-100 text-emerald-700"
                                                                                }`}>
                                                                                {b.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-slate-500">
                                                                            {b.trend?.toLowerCase().includes('ris') || b.trend?.toLowerCase().includes('fall') ? (
                                                                                <span className="flex items-center gap-1 text-amber-600">
                                                                                    <Activity size={12} /> {b.trend}
                                                                                </span>
                                                                            ) : (
                                                                                <span>{b.trend || "-"}</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 2. Medicines Block */}
                                            {analysisData.medicines && analysisData.medicines.length > 0 && (
                                                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                                    <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
                                                        <Pill size={18} className="text-blue-600" /> Extracted Medicines
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {analysisData.medicines.map((med: any, idx: number) => (
                                                            <div key={idx} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm flex flex-col gap-2">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <span className="font-semibold text-slate-900">{med.name}</span>
                                                                        {med.strength && <span className="text-xs text-slate-500 ml-1">({med.strength})</span>}
                                                                    </div>
                                                                    {med.type && (
                                                                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                                            {med.type}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2 rounded">
                                                                    <div className="flex gap-2">
                                                                        <span className="text-slate-400 font-medium w-12 shrink-0">Dosage:</span>
                                                                        <span>{med.dosage || "As advised"}</span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <span className="text-slate-400 font-medium w-12 shrink-0">Timing:</span>
                                                                        <span>{med.timing || "See Prescription"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 3. Detailed Analysis (Markdown) */}
                                            <article className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-600">
                                                <h4 className="text-slate-900 font-semibold mb-2">Detailed Findings</h4>
                                                <ReactMarkdown>{analysisData.analysis}</ReactMarkdown>
                                            </article>

                                            {/* 4. Debug Info (Metadata) */}
                                            <div className="border-t border-slate-200 pt-4">
                                                <details className="group">
                                                    <summary className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-400 hover:text-orange-600">
                                                        <FileSearch size={14} /> View Analysis Metadata
                                                    </summary>
                                                    <div className="mt-3 bg-slate-50 p-3 rounded text-xs font-mono text-slate-600 overflow-x-auto">
                                                        <p>Page Count: {analysisData.meta?.pageCount}</p>
                                                        <p>Report Date: {analysisData.meta?.reportDate}</p>
                                                        <p>Doc Type: {analysisData.meta?.reportType}</p>
                                                    </div>
                                                </details>
                                            </div>
                                        </div>

                                        {/* Disclaimer Footer */}
                                        <div className="p-4 bg-orange-50 border-t border-orange-100 text-xs text-orange-800 text-center">
                                            <p className="font-bold flex items-center justify-center gap-2">
                                                <AlertCircle size={14} />
                                                AI Verification Required
                                            </p>
                                            <p className="opacity-80 mt-1">{analysisData.disclaimer || "Consult a specialist before taking action."}</p>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200/60 rounded-2xl bg-white/30 backdrop-blur-sm p-8 text-center">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                    <Brain size={48} className="text-slate-300" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Health Memory Active</h3>
                                <p className="text-sm mt-2 max-w-xs mx-auto">Upload any Lab Report, Prescription, or Scan. Yukti AI will analyze it and compare it with your {history.length} past records.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div >
    );
}
