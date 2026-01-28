import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpenseChartProps {
    data: { name: string; value: number; color: string }[];
}

export const ExpenseChart = ({ data }: ExpenseChartProps) => {
    const total = data.reduce((a, b) => a + b.value, 0);

    // If no data, show empty state
    if (total === 0) {
        return (
            <div className="h-[220px] bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-gray-400">
                <PieChart width={100} height={100}>
                    <Pie data={[{ value: 1 }]} innerRadius={35} outerRadius={45} fill="#E5E7EB" dataKey="value" stroke="none" />
                </PieChart>
                <span className="text-xs font-bold mt-2">Sin gastos aún</span>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 border border-gray-100 dark:border-white/5">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 ml-1">Distribución</h3>

            <div className="flex items-center">
                {/* Chart */}
                <div className="w-[120px] h-[120px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total Label if simple? Or just graphic. Clean graphic. */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-gray-400">Total</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 pl-6 space-y-3">
                    {data.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="font-bold text-gray-600 dark:text-gray-400">{d.name}</span>
                            </div>
                            <span className="font-black text-gray-900 dark:text-white">${d.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
