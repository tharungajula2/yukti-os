"use client";

import { motion } from "framer-motion";
import { MessageCircle, Check, CheckCheck, Phone, Video, MoreVertical, Send } from "lucide-react";

export function WhatsAppDemo() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* HEADER */}
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-green-600 bg-green-50 p-1.5 rounded-lg">
                        <MessageCircle size={28} />
                    </span>
                    WhatsApp Assistant (Beta)
                </h2>
                <p className="text-slate-500 mt-2 text-sm md:text-lg">No app required for seniors. We chat with them where they are.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* LEFT: PHONE MOCKUP */}
                <div className="flex justify-center">
                    <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[40px] shadow-2xl border-[8px] border-slate-800 overflow-hidden">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>

                        {/* WA Header */}
                        <div className="bg-[#075E54] text-white p-4 pt-10 flex items-center justify-between shadow-md relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">Y</div>
                                <div>
                                    <h4 className="font-bold text-sm">Yukti Care</h4>
                                    <p className="text-[10px] opacity-80">Official Business Account</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Video size={18} />
                                <Phone size={18} />
                                <MoreVertical size={18} />
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="bg-[#E5DDD5] h-full p-4 space-y-4 overflow-y-auto pb-20 pt-4">
                            {/* Date Bubble */}
                            <div className="flex justify-center">
                                <span className="bg-[#dcf8c6] text-xs text-slate-600 px-2 py-1 rounded shadow-sm">Today</span>
                            </div>

                            {/* Encyclopedia encrypted msg */}
                            <div className="bg-[#fcf4a3] p-2 text-[10px] text-center text-slate-600 rounded-lg shadow-sm">
                                🔒 Messages are end-to-end encrypted.
                            </div>

                            {/* Bot Msg 1 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white p-2.5 rounded-br-lg rounded-tr-lg rounded-bl-lg shadow-sm border border-black/5 max-w-[85%]"
                            >
                                <p className="text-xs text-slate-900 leading-relaxed">
                                    Namaste Nani! It is 9 AM. ☀️ <br />Time for your medicine: <b>Metformin 500mg</b>.
                                </p>
                                <span className="text-[9px] text-slate-400 block text-right mt-1">09:00 AM</span>
                            </motion.div>

                            {/* User Msg 1 */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.5 }}
                                className="bg-[#dcf8c6] p-2.5 ml-auto rounded-tl-lg rounded-tr-lg rounded-bl-lg shadow-sm border border-black/5 max-w-[80%]"
                            >
                                <p className="text-xs text-slate-900">Taken beta.</p>
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[9px] text-slate-500">09:05 AM</span>
                                    <CheckCheck size={12} className="text-blue-500" />
                                </div>
                            </motion.div>

                            {/* Bot Msg 2 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 2.5 }}
                                className="bg-white p-2.5 rounded-br-lg rounded-tr-lg rounded-bl-lg shadow-sm border border-black/5 max-w-[85%]"
                            >
                                <p className="text-xs text-slate-900 leading-relaxed">
                                    Great! I have updated your log. ✅ <br />
                                    How is your knee pain today?
                                </p>
                                <span className="text-[9px] text-slate-400 block text-right mt-1">09:05 AM</span>
                            </motion.div>

                            {/* User Msg 2 */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 3.5 }}
                                className="bg-[#dcf8c6] p-2.5 ml-auto rounded-tl-lg rounded-tr-lg rounded-bl-lg shadow-sm border border-black/5 max-w-[80%]"
                            >
                                <p className="text-xs text-slate-900">Better. I walked in the park.</p>
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[9px] text-slate-500">09:08 AM</span>
                                    <CheckCheck size={12} className="text-blue-500" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Input Area */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#F0F2F5] px-2 flex items-center gap-2 z-20">
                            <div className="h-9 w-9 bg-white rounded-full flex items-center justify-center text-slate-400">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                            </div>
                            <div className="flex-1 bg-white h-9 rounded-full px-4 text-xs flex items-center text-slate-400">
                                Type a message
                            </div>
                            <div className="h-9 w-9 bg-[#00897B] rounded-full flex items-center justify-center text-white">
                                <Send size={16} />
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT: CONFIG PANEL */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Bot Configuration</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-sm font-semibold text-slate-700">Status</span>
                                </div>
                                <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                                    Active: +91 98*** *****
                                </span>
                            </div>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Daily Summary to Family</span>
                                <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Emergency Alerts</span>
                                <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Language</span>
                                <select className="text-xs border rounded p-1 bg-white">
                                    <option>English (Hinglish)</option>
                                    <option>Hindi</option>
                                    <option>Telugu</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                        <h3 className="font-bold text-orange-900 mb-2">Why WhatsApp?</h3>
                        <p className="text-sm text-orange-800/80 leading-relaxed">
                            Most elderly users struggle with downloading new apps, remembering passwords, or navigating complex UIs.
                            WhatsApp is muscle memory for them. Yukti connects to the WhatsApp Business API to deliver care
                            where the user is most comfortable.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
