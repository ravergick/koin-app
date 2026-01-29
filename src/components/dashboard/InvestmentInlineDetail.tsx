import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InvestmentInlineDetailProps {
    transactions: any[];
    total: number;
    categories: any[];
}

export const InvestmentInlineDetail = ({ transactions, total, categories }: InvestmentInlineDetailProps) => {
    const [showAll, setShowAll] = useState(false);

    // Group by category
    const chartData = React.useMemo(() => {
        const stats: Record<string, { value: number; color: string; name: string }> = {};

        transactions.forEach(t => {
            const cat = categories.find(c => c.id === t.categoriaId);
            const name = cat ? cat.nombre : 'General';
            const color = cat ? cat.color : '#A855F7'; // Purple default

            if (!stats[name]) stats[name] = { value: 0, color, name };
            stats[name].value += t.monto;
        });

        // Calculate percentages
        return Object.values(stats)
            .sort((a, b) => b.value - a.value)
            .map(item => ({
                ...item,
                percent: total > 0 ? (item.value / total) * 100 : 0
            }));
    }, [transactions, categories, total]);

    const displayedTransactions = showAll ? transactions : transactions.slice(0, 3);

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-5 border border-gray-100 dark:border-white/5 mb-4 animate-fade-in shadow-sm">

            {/* Header: Title & Total */}
            <div className="flex justify-between items-end mb-3">
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Invertido</h3>
                    <p className="text-xl font-black text-purple-500 tracking-tighter">${total.toLocaleString()}</p>
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
                                    {d.name} <span className="text-gray-400 ml-0.5">{Math.round(d.percent)}%</span>
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}


            <div className="h-[1px] bg-gray-100 dark:bg-white/5 mb-3"></div>

            <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Listado</h4>

                {transactions.length === 0 ? (
                    <p className="text-center text-gray-400 text-[10px] py-2">Sin registros</p>
                ) : (
                    <div className="space-y-2">
                        {displayedTransactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center py-2 px-1 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white text-[11px] truncate pr-2">{tx.description}</p>
                                    <p className="text-[9px] text-gray-400">{new Date(tx.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                                </div>
                                <span className="text-xs font-black text-purple-500 whitespace-nowrap">+${tx.monto.toLocaleString()}</span>
                            </div>
                        ))}
                        {transactions.length > 3 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 hover:text-purple-500 py-2 transition-colors"
                            >
                                {showAll ? 'Ver menos' : `Ver ${transactions.length - 3} más`}
                                {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
