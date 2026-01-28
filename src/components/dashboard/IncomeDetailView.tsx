import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronLeft, Calendar } from 'lucide-react';

interface IncomeDetailViewProps {
    transactions: any[];
    categories: any[];
    totalIncome: number;
    onBack: () => void;
    monthName: string;
}

export const IncomeDetailView = ({ transactions, categories, totalIncome, onBack, monthName }: IncomeDetailViewProps) => {

    // Prepare chart data (income sources if we had categories for income, otherwise just show total)
    const chartData = [
        { name: 'Ingresos', value: totalIncome, color: '#10B981' }
    ];

    return (
        <div className="flex-1 overflow-y-auto pb-32 px-5 py-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#1C1C1E] flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-transform"
                >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg">{monthName}</span>
            </div>

            {/* Title */}
            <div className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Ingresos del Mes</h1>
                <p className="text-emerald-500 text-2xl font-black mt-1">${totalIncome.toLocaleString()}</p>
            </div>

            {/* Simple Chart Section */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 mb-6">
                <div className="flex items-center justify-center">
                    <div className="w-[140px] h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={65}
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
                </div>
            </div>

            {/* Transaction List */}
            <div>
                <h2 className="text-sm font-black text-gray-900 dark:text-white mb-3 px-1">Detalle de Ingresos</h2>
                <div className="space-y-2">
                    {transactions.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            No hay ingresos registrados este mes
                        </div>
                    ) : (
                        transactions.map(tx => (
                            <div key={tx.id} className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-4 border border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{tx.description}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(tx.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                                </div>
                                <span className="text-lg font-black text-emerald-500">+${tx.monto.toLocaleString()}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
