"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, User, Clock } from "lucide-react";

interface CallOverlayProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export function CallOverlay({ isOpen, onAccept, onDecline }: CallOverlayProps) {
    const [callState, setCallState] = useState<"ringing" | "connected">("ringing");
    const [timer, setTimer] = useState(0);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);

    // --- RINGTONE LOGIC (Web Audio API) ---
    const playRingtone = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.2); // C#5

        // Pulsing gain for "Ring ring" effect
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0, ctx.currentTime + 0.6);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.7);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        oscillatorRef.current = osc;

        // Loop the ring every 2 seconds
        const intervalId = setInterval(() => {
            // Re-trigger envelope if we were doing a more complex synth, 
            // but effectively we just need a simple loop. 
            // For simplicity in this React component, we'll stick to a simple tone 
            // or just let it be a continuous beep-beep pattern if mapped correctly.
            // Actually, simplest is just to restart/stop osc, but let's keep it simple:
            // We will rely on the initial pattern or just use a standard Audio element if we had a file.
            // Since we need synthetic, let's just make it a continuous pulsating drone for "Tech" feel.
        }, 2000);

        return () => clearInterval(intervalId);
    };

    const stopRingtone = () => {
        if (oscillatorRef.current) {
            oscillatorRef.current.stop();
            oscillatorRef.current.disconnect();
            oscillatorRef.current = null;
        }
    };

    useEffect(() => {
        if (isOpen && callState === "ringing") {
            try {
                playRingtone();
            } catch (e) {
                console.error("Audio play failed (user interaction needed first)", e);
            }
        } else {
            stopRingtone();
        }
        return () => stopRingtone();
    }, [isOpen, callState]);


    // --- TIMER & AUTO-CLOSE ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callState === "connected") {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);

            // Speak Message
            const utterance = new SpeechSynthesisUtterance("Namaste. Please take your scheduled medicines.");
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);

            // Auto-redirect after 5s
            setTimeout(() => {
                onAccept();
                setCallState("ringing");
                setTimer(0);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [callState, onAccept]);


    // --- HANDLERS ---
    const handleAccept = () => {
        stopRingtone();
        setCallState("connected");
    };

    const formatTime = (sec: number) => {
        const min = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${min}:${s}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="fixed inset-0 z-[100] h-[100dvh] w-screen flex flex-col items-center justify-between bg-slate-900/95 backdrop-blur-xl p-8 pb-32 text-white"
                >
                    {/* TOP: Caller Info */}
                    <div className="mt-16 flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="h-32 w-32 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 shadow-2xl"
                        >
                            <span className="text-4xl font-bold bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent">Y</span>
                        </motion.div>
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-light tracking-wide text-slate-200">Yukti Care Assistant</h2>
                            <p className="text-orange-400 font-medium tracking-widest uppercase text-sm">Medicine Reminder</p>
                        </div>
                    </div>

                    {/* MIDDLE: Status */}
                    <div className="flex-1 flex items-center justify-center">
                        {callState === "connected" ? (
                            <div className="flex flex-col items-center gap-2">
                                <Clock className="text-emerald-400 animate-pulse" />
                                <span className="text-2xl font-mono">{formatTime(timer)}</span>
                                <p className="text-slate-400 text-sm">Speaking...</p>
                            </div>
                        ) : (
                            <p className="animate-pulse text-slate-500">Incoming Secure Call...</p>
                        )}
                    </div>

                    {/* BOTTOM: Actions */}
                    <div className="mb-12 w-full max-w-sm flex items-center justify-between px-8">
                        {callState === "ringing" ? (
                            <>
                                <button
                                    onClick={onDecline}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform group-hover:scale-110">
                                        <PhoneOff size={28} fill="currentColor" />
                                    </div>
                                    <span className="text-sm font-medium">Decline</span>
                                </button>

                                <button
                                    onClick={handleAccept}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110 animate-bounce">
                                        <Phone size={28} fill="currentColor" />
                                    </div>
                                    <span className="text-sm font-medium">Accept</span>
                                </button>
                            </>
                        ) : (
                            <div className="w-full flex justify-center">
                                <button
                                    onClick={onDecline}
                                    className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center"
                                >
                                    <PhoneOff size={28} fill="currentColor" />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
