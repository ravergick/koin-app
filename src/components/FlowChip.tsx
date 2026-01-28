import React from "react";

export const FlowChip = ({ title, value, type, privacyMode }: any) => {
    const isIncome = type === 'income';
    const color = isIncome ? 'text-emerald-500' : 'text-rose-500';
    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] px-3 py-3.5 flex-1 flex flex-col border border-gray-100 dark:border-white/5 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 mb-0.5 tracking-tight">{title}</span>
            <span className={`text-[18px] font-black tracking-tight ${color} ${privacyMode ? 'blur-md' : ''}`}>
                ${value.toLocaleString()}
            </span>
        </div>
    );
};
