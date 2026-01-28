import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ExpenseInlineDetailProps {
    transactions: any[];
    categories: any[];
    chartData: { name: string; value: number; color: string }[];
}

export const ExpenseInlineDetail = ({ transactions, categories, chartData }: ExpenseInlineDetailProps) => {

    const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);
    const total = chartData.reduce((a, b) => a + b.value, 0);

    const toggleCategory = (categoryName: string) => {
        if (expandedCategory === categoryName) setExpandedCategory(null);
        else setExpandedCategory(categoryName);
    };

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
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1">Detalle Gastos</h3>
                    <p className="text-2xl font-black text-rose-500 tracking-tighter">${total.toLocaleString()}</p>
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

            {/* List */}
            <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Por Categorías</h4>
                {chartData.length === 0 ? (
                    <p className="text-center text-gray-400 text-xs py-4">Sin gastos</p>
                ) : (
                    chartData.map((data, index) => {
                        const percentage = total > 0 ? Math.round((data.value / total) * 100) : 0;
                        const isExpanded = expandedCategory === data.name;

                        // Find category to match transactions
                        const categoryObj = categories.find(c => c.nombre === data.name);
                        const categoryTx = categoryObj
                            ? transactions.filter(t => t.categoriaId === categoryObj.id)
                            : [];

                        return (
                            <div key={index} className="border-b border-gray-100 dark:border-white/5 last:border-0">
                                {/* Category Header */}
                                <div
                                    onClick={() => toggleCategory(data.name)}
                                    className="flex justify-between items-center py-2 px-1 cursor-pointer active:opacity-70 transition-opacity"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                            style={{ backgroundColor: data.color }}
                                        >
                                            {data.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-xs">{data.name}</p>
                                            <p className="text-[10px] text-gray-400">{percentage}% del total</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-rose-500">-${data.value.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Transactions Sub-list */}
                                {isExpanded && (
                                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 mb-3 mt-1 animate-fade-in space-y-2 ml-4">
                                        {categoryTx.length === 0 ? (
                                            <p className="text-[10px] text-gray-400 text-center">No hay detalles</p>
                                        ) : (
                                            categoryTx.map(tx => (
                                                <div key={tx.id} className="flex justify-between items-center text-xs">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-700 dark:text-gray-300">{tx.description}</span>
                                                        <span className="text-[9px] text-gray-400">{new Date(tx.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                                                    </div>
                                                    <span className="font-bold text-rose-500">-${tx.monto.toLocaleString()}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
