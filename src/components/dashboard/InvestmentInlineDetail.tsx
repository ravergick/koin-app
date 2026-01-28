import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface InvestmentInlineDetailProps {
    transactions: any[];
    total: number;
    categories: any[];
}

export const InvestmentInlineDetail = ({ transactions, total, categories }: InvestmentInlineDetailProps) => {

    // Group by category
    const chartData = React.useMemo(() => {
        const stats: Record<string, { value: number; color: string; name: string }> = {};

        transactions.forEach(t => {
            const cat = categories.find(c => c.id === t.categoriaId);
            const name = cat ? cat.nombre : 'General';
            const color = cat ? cat.color : '#3B82F6'; // Blue default

            if (!stats[name]) stats[name] = { value: 0, color, name };
            stats[name].value += t.monto;
        });

        return Object.values(stats).sort((a, b) => b.value - a.value);
    }, [transactions, categories]);


    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 mb-6 animate-fade-in shadow-sm">

            {/* Header / Chart */}
            <div className="flex items-center gap-6 mb-6">
                <div className="w-[100px] h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1">Total Invertido</h3>
                    <p className="text-2xl font-black text-blue-500 tracking-tighter">${total.toLocaleString()}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {chartData.map((d, i) => {
                            const percentage = total > 0 ? Math.round((d.value / total) * 100) : 0;
                            if (percentage < 5) return null;
                            return (
                                <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ backgroundColor: d.color }}>
                                    {d.name} {percentage}%
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 pl-1">Movimientos</h3>
            {transactions.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-4">Sin inversiones registradas</p>
            ) : (
                <div className="space-y-3">
                    {transactions.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center py-2 px-1 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-xs">{tx.description}</p>
                                <p className="text-[10px] text-gray-400">{new Date(tx.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                            </div>
                            <span className="text-sm font-black text-blue-500">+${tx.monto.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
