import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardProps {
    income: number;
    expenses: number;
    balance: number;
    onIncomeClick?: () => void;
    onExpenseClick?: () => void;
}

export const SummaryCard = ({ income, expenses, balance, onIncomeClick, onExpenseClick }: SummaryCardProps) => {
    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
            {/* Balance Header */}
            <div className="text-center mb-6 z-10 relative">
                <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Flujo de Caja (Mes)</span>
                <h1 className={`text-4xl font-black tracking-tighter mt-1 ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-rose-500'}`}>
                    ${balance.toLocaleString()}
                </h1>
            </div>

            {/* Income / Expense Row */}
            <div className="flex gap-4">
                {/* Income */}
                <button
                    onClick={onIncomeClick}
                    className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-[24px] p-4 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                >
                    <div className="bg-emerald-100 dark:bg-emerald-500/20 w-8 h-8 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                        <TrendingUp size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase">Ingresos</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        ${income.toLocaleString()}
                    </span>
                </button>

                {/* Expenses */}
                <button
                    onClick={onExpenseClick}
                    className="flex-1 bg-rose-50 dark:bg-rose-500/10 rounded-[24px] p-4 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                >
                    <div className="bg-rose-100 dark:bg-rose-500/20 w-8 h-8 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mb-1">
                        <TrendingDown size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/70 uppercase">Gastos</span>
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight">
                        ${expenses.toLocaleString()}
                    </span>
                </button>
            </div>
        </div>
    );
};
