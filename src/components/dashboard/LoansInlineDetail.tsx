import React, { useState } from 'react';
import { CreditCard, Landmark, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { deleteData } from '../../services/firebase';

interface LoansInlineDetailProps {
    debts: any[];
    creditCardsBalance: number;
    onViewCards: () => void;
}

export const LoansInlineDetail = ({ debts, creditCardsBalance, onViewCards }: LoansInlineDetailProps) => {
    const [showAll, setShowAll] = useState(false);

    const chartData = React.useMemo(() => {
        const data = [];
        if (creditCardsBalance > 0) {
            data.push({ name: 'Tarjetas', value: creditCardsBalance, color: '#F97316' }); // Orange-500
        }
        debts.forEach(d => {
            data.push({ name: d.bank, value: d.currentBalance, color: '#EA580C' }); // Orange-600 darker
        });

        const totalCalc = data.reduce((a, b) => a + b.value, 0);

        return data
            .sort((a, b) => b.value - a.value)
            .map(item => ({
                ...item,
                percent: totalCalc > 0 ? (item.value / totalCalc) * 100 : 0
            }));

    }, [debts, creditCardsBalance]);

    const total = chartData.reduce((a, b) => a + b.value, 0);

    const allItems = [
        ...(creditCardsBalance > 0 ? [{ type: 'card', id: 'cc-summary', value: creditCardsBalance }] : []),
        ...debts.map(d => ({ type: 'debt', ...d }))
    ];

    const displayedItems = showAll ? allItems : allItems.slice(0, 3);

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-5 border border-gray-100 dark:border-white/5 mb-4 animate-fade-in shadow-sm">

            {/* Header: Title & Total */}
            <div className="flex justify-between items-end mb-3">
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Deuda</h3>
                    <p className="text-xl font-black text-orange-500 tracking-tighter">${total.toLocaleString()}</p>
                </div>
            </div>

            {/* Stacked Bar */}
            <div className="w-full h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden flex mb-3">
                {total === 0 ? (
                    <div className="w-full h-full bg-gray-200 dark:bg-white/5"></div>
                ) : (
                    chartData.map((seg, i) => (
                        <div
                            key={i}
                            style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
                            className="h-full first:rounded-l-full last:rounded-r-full"
                        />
                    ))
                )}
            </div>

            {/* Legend Chips */}
            {total > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {chartData.map((d, i) => {
                        if (d.percent < 5) return null;
                        return (
                            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-white/5 rounded-md border border-gray-100 dark:border-white/5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                                    {d.name.substring(0, 15)} <span className="text-gray-400 ml-0.5">{Math.round(d.percent)}%</span>
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}


            <div className="h-[1px] bg-gray-100 dark:bg-white/5 mb-3"></div>

            {/* 1. CREDIT CARDS SECTION */}
            {creditCardsBalance > 0 && (
                <div className="mb-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1 mb-2">Tarjetas de Crédito</h4>
                    <div className="space-y-2">
                        <div
                            onClick={onViewCards}
                            className="flex justify-between items-center py-2 px-1 border-b border-gray-100 dark:border-white/5 cursor-pointer active:opacity-70"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                    <CreditCard size={14} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-xs">Total Tarjetas</p>
                                    <p className="text-[10px] text-gray-400">Ver detalles</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-orange-500">${creditCardsBalance.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. LOANS SECTION */}
            {debts.length > 0 && (
                <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1 mb-2">Préstamos</h4>
                    <div className="space-y-2">
                        {debts.map(d => (
                            <div key={d.id} className="flex justify-between items-center py-2 px-1 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                        <Landmark size={14} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-xs">{d.name}</p>
                                        <p className="text-[10px] text-gray-400">{d.bank}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-orange-500">${d.currentBalance.toLocaleString()}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('¿Eliminar esta deuda?')) deleteData("debts", d.id);
                                        }}
                                        className="text-gray-300 hover:text-orange-500 p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {allItems.length === 0 && <p className="text-center text-gray-400 text-[10px] py-4">Libre de deudas</p>}

        </div>
    );
};
