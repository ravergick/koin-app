import React from "react";

export const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    if (total === 0) return (
        <div className="w-40 h-40 mx-auto mb-4 rounded-full border-4 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center">
            <span className="text-gray-400 text-[10px] font-bold">Sin datos</span>
        </div>
    );

    let currentAngle = 0;
    const radius = 35;
    const center = 50;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="relative w-44 h-44 mx-auto mb-4 animate-fade-in">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {data.map((segment, i) => {
                    if (segment.value === 0) return null;
                    const percentage = (segment.value / total) * 100;
                    const dashArray = (percentage / 100) * circumference;
                    const dashOffset = (currentAngle / 100) * circumference;
                    const result = (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${dashArray} ${circumference}`}
                            strokeDashoffset={-dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    );
                    currentAngle += percentage;
                    return result;
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400 tracking-tight">Gastado</span>
                <span className="text-[20px] font-black text-gray-900 dark:text-white">${total.toLocaleString()}</span>
            </div>
        </div>
    );
};
