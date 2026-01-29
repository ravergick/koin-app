import React from "react";

export const MainWidget = ({ title, value, theme, icon: Icon, onClick, privacyMode }: any) => {
    const CompIcon = Icon;

    let colorClass = 'text-emerald-500';
    let bgClass = 'bg-emerald-500/10';

    if (theme === 'red') {
        colorClass = 'text-rose-500';
        bgClass = 'bg-rose-500/10';
    } else if (theme === 'blue') {
        colorClass = 'text-blue-500';
        bgClass = 'bg-blue-500/10';
    } else if (theme === 'indigo') {
        colorClass = 'text-indigo-500';
        bgClass = 'bg-indigo-500/10';
    } else if (theme === 'purple') {
        colorClass = 'text-purple-500';
        bgClass = 'bg-purple-500/10';
    } else if (theme === 'orange') {
        colorClass = 'text-orange-500';
        bgClass = 'bg-orange-500/10';
    }

    return (
        <button
            onClick={onClick}
            className="w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-[26px] active:scale-[0.97] transition-all flex flex-col justify-between h-[96px] text-left border border-gray-100 dark:border-white/5 shadow-sm"
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bgClass}`}>
                <CompIcon size={18} className={colorClass} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 mb-0.5 tracking-tight">{title}</p>
                <h3 className={`text-[17px] font-black text-gray-900 dark:text-white leading-none tracking-tight ${privacyMode ? 'blur-sm opacity-20' : ''}`}>
                    ${value.toLocaleString()}
                </h3>
            </div>
        </button>
    );
};
