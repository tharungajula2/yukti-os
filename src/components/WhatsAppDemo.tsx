"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Phone, Video, ArrowLeft, MoreVertical, Paperclip, Smile, Mic, CheckCheck, Clock } from "lucide-react";

interface Message {
    id: number;
    text: string;
    sender: "bot" | "user";
    timestamp: string;
    status: "sent" | "delivered" | "read";
    type?: "text" | "option";
    options?: string[]; // Quick replies
}

export function WhatsAppDemo() {
    const [messages, setMessages] = useState<Message[]>([
        // Initial state with demo message
        {
            id: 1,
            text: "Namaste Nani! 🙏\nTime for your afternoon medicines:\n- Glycomet 850mg (After Food)",
            sender: "bot",
            timestamp: "1:30 PM",
            status: "read",
            type: "option",
            options: ["Taken ✅", "Snooze 30m ⏰"]
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        // 1. Add User Message
        const tempId = Date.now();
        const userMsg: Message = {
            id: tempId,
            text: text,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "sent"
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

        // 2. Trigger Bot Response
        setIsTyping(true);

        setTimeout(() => {
            let botText = "I've logged that for you. Anything else?";
            let options: string[] | undefined = undefined;

            const lower = text.toLowerCase();
            if (lower.includes("taken") || lower.includes("yes")) {
                botText = "Great! 👍 I've updated your log. \n\nHow is your knee pain today on a scale of 1-10?";
                options = ["No Pain", "Mild (1-3)", "Moderate (4-6)", "Severe (7-10)"];
            } else if (lower.includes("snooze")) {
                botText = "Okay Nani, I will remind you again in 30 minutes. Please eat something before taking it! 🍎";
            } else if (lower.includes("pain") || lower.match(/[0-9]/)) {
                // Simple logic: if number or pain mentioned
                botText = "Noted. I'll share this with Dr. Aruna in the weekly report. Rest well! 🛋️";
            } else {
                botText = "I am just a demo bot right now, but I am learning! 🧠";
            }

            const botMsg: Message = {
                id: Date.now() + 1,
                text: botText,
                sender: "bot",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: "read",
                type: options ? "option" : "text",
                options: options
            };

            setIsTyping(false);
            setMessages(prev => [...prev, botMsg]);

        }, 1500); // 1.5s delay for realism
    };

    return (
        <div className="flex items-center justify-center h-full bg-slate-50 p-4">
            {/* PHONE FRAME */}
            <div className="w-[380px] h-[680px] bg-black rounded-[45px] p-3 shadow-2xl relative border-4 border-slate-800 ring-4 ring-slate-200">

                {/* Dynamic island / Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20"></div>

                {/* SCREEN */}
                <div className="w-full h-full bg-[#E5DDD5] rounded-[38px] overflow-hidden flex flex-col relative">
                    {/* WALLPAPER PATTERN */}
                    <div className="absolute inset-0 opacity-[0.06] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] pointer-events-none"></div>

                    {/* HEADER */}
                    <div className="bg-[#075E54] text-white p-4 pt-10 flex items-center justify-between shadow-sm z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <ArrowLeft size={20} className="cursor-pointer" />
                            <div className="relative">
                                <div className="h-9 w-9 bg-white rounded-full flex items-center justify-center overflow-hidden">
                                    <span className="text-[#075E54] font-bold text-lg">Y</span>
                                </div>
                                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-400 rounded-full border-2 border-[#075E54]"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-base leading-tight">Yukti Care</h3>
                                <p className="text-[10px] opacity-80">Online</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Video size={20} />
                            <Phone size={20} />
                            <MoreVertical size={20} />
                        </div>
                    </div>

                    {/* CHAT AREA */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                            >
                                {/* Message Bubble */}
                                <div
                                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm shadow-sm relative ${msg.sender === "user"
                                        ? "bg-[#D9FDD3] text-slate-900 rounded-tr-none"
                                        : "bg-white text-slate-900 rounded-tl-none"
                                        }`}
                                >
                                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[9px] text-slate-500/80">{msg.timestamp}</span>
                                        {msg.sender === "user" && <CheckCheck size={12} className="text-blue-500" />}
                                    </div>
                                </div>

                                {/* Quick Replies (Bot only) */}
                                {msg.sender === 'bot' && msg.options && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {msg.options.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => handleSendMessage(opt)}
                                                className="bg-white border border-[#075E54] text-[#075E54] px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-[#075E54] hover:text-white transition-colors"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-2 text-slate-500 text-xs ml-2">
                                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT AREA */}
                    <div className="absolute bottom-0 w-full bg-[#F0F2F5] p-2 px-3 flex items-center gap-2 z-20">
                        <div className="p-2 text-slate-500 hover:bg-slate-200 rounded-full cursor-pointer">
                            <Smile size={24} />
                        </div>
                        <div className="p-2 text-slate-500 hover:bg-slate-200 rounded-full cursor-pointer">
                            <Paperclip size={20} />
                        </div>

                        <div className="flex-1 bg-white rounded-lg px-4 py-2 shadow-sm flex items-center">
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                                placeholder="Type a message"
                                className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        {inputValue.trim() ? (
                            <button onClick={() => handleSendMessage(inputValue)} className="p-2.5 bg-[#075E54] text-white rounded-full shadow-md hover:scale-105 transition-transform">
                                <Send size={18} className="translate-x-0.5" />
                            </button>
                        ) : (
                            <div className="p-2.5 bg-[#075E54] text-white rounded-full shadow-md cursor-pointer hover:scale-105 transition-transform">
                                <Mic size={18} />
                            </div>
                        )}
                    </div>

                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full"></div>
            </div>
        </div>
    );
}
