import React from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

export const CompactHeader = ({ currentDate, setDate, privacyMode, setPrivacyMode }: any) => {
    const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate);

    const adjust = (n: number) => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + n);
        setDate(d);
    };

    return (
        <header className="flex justify-between items-center px-4 pt-safe h-[48px]">
            <div className="flex items-center bg-gray-200/40 dark:bg-white/5 p-1 rounded-full border border-gray-300/10 backdrop-blur-md">
                <button onClick={() => adjust(-1)} className="w-7 h-7 flex items-center justify-center text-gray-400 active:text-gray-900 dark:active:text-white transition-colors">
                    <ChevronLeft size={14} strokeWidth={3} />
                </button>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 px-3 min-w-[90px] text-center capitalize tracking-tight">
                    {label}
                </span>
                <button onClick={() => adjust(1)} className="w-7 h-7 flex items-center justify-center text-gray-400 active:text-gray-900 dark:active:text-white transition-colors">
                    <ChevronRight size={14} strokeWidth={3} />
                </button>
            </div>

            <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`p-2 rounded-full transition-all active:scale-90 ${privacyMode ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-500/20' : 'bg-gray-200/40 dark:bg-white/5 text-gray-500'}`}
            >
                {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </header>
    );
};
