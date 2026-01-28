import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface IncomeInlineDetailProps {
    transactions: any[];
    totalIncome: number;
}

export const IncomeInlineDetail = ({ transactions, totalIncome }: IncomeInlineDetailProps) => {

    // Prepare chart data (simple total for now, or categorized if available)
    const chartData = [
        { name: 'Ingresos', value: totalIncome, color: '#10B981' }
    ];

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
                                paddingAngle={0}
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
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1">Detalle Ingresos</h3>
                    <p className="text-2xl font-black text-emerald-500 tracking-tighter">${totalIncome.toLocaleString()}</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-2">100% Ingresos Totales</p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Listado</h4>
                {transactions.length === 0 ? (
                    <p className="text-center text-gray-400 text-xs py-4">Sin registros</p>
                ) : (
                    transactions.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center py-2 px-1 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-xs">{tx.description}</p>
                                <p className="text-[10px] text-gray-400">{new Date(tx.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                            </div>
                            <span className="text-sm font-black text-emerald-500">+${tx.monto.toLocaleString()}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
