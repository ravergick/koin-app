import React from 'react';
import { CreditCard, Landmark, Trash2 } from 'lucide-react';
import { deleteData } from '../../services/firebase';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface LoansInlineDetailProps {
    debts: any[];
    creditCardsBalance: number;
    onViewCards: () => void;
}

export const LoansInlineDetail = ({ debts, creditCardsBalance, onViewCards }: LoansInlineDetailProps) => {

    const chartData = React.useMemo(() => {
        const data = [];
        if (creditCardsBalance > 0) {
            data.push({ name: 'Tarjetas', value: creditCardsBalance, color: '#F43F5E' }); // Rose
        }
        debts.forEach(d => {
            data.push({ name: d.bank, value: d.currentBalance, color: '#EF4444' }); // Red-500 equivalent, maybe vary slightly?
        });

        // Let's give slight color variations if needed, or simple reds
        return data.sort((a, b) => b.value - a.value);
    }, [debts, creditCardsBalance]);

    const total = chartData.reduce((a, b) => a + b.value, 0);

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
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1">Total Deuda</h3>
                    <p className="text-2xl font-black text-rose-500 tracking-tighter">${total.toLocaleString()}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {chartData.map((d, i) => {
                            const percentage = total > 0 ? Math.round((d.value / total) * 100) : 0;
                            if (percentage < 5) return null;
                            return (
                                <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ backgroundColor: d.color }}>
                                    {d.name.substring(0, 10)} {percentage}%
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 pl-1">Desglose</h3>

            <div className="space-y-4">
                {/* Credit Cards Summary */}
                <div
                    onClick={onViewCards}
                    className="flex justify-between items-center py-3 px-2 border-b border-gray-100 dark:border-white/5 cursor-pointer active:opacity-70"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                            <CreditCard size={16} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-xs">Tarjetas de Crédito</p>
                            <p className="text-[10px] text-gray-400">Saldo pendiente</p>
                        </div>
                    </div>
                    <span className="text-sm font-black text-rose-500">${creditCardsBalance.toLocaleString()}</span>
                </div>

                {/* Debts List */}
                {debts.length === 0 && creditCardsBalance === 0 ? (
                    <p className="text-center text-gray-400 text-xs py-2">Libre de deudas</p>
                ) : (
                    debts.map(d => (
                        <div key={d.id} className="flex justify-between items-center py-3 px-2 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                    <Landmark size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-xs">{d.name}</p>
                                    <p className="text-[10px] text-gray-400">{d.bank}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-rose-500">${d.currentBalance.toLocaleString()}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('¿Eliminar esta deuda?')) deleteData("debts", d.id);
                                    }}
                                    className="text-gray-300 hover:text-rose-500"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
