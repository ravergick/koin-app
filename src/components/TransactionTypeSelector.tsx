import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Target, X } from 'lucide-react';

interface TransactionTypeSelectorProps {
    onSelect: (type: 'gasto' | 'ingreso' | 'ahorro' | 'inversion') => void;
    onClose: () => void;
}

export const TransactionTypeSelector: React.FC<TransactionTypeSelectorProps> = ({ onSelect, onClose }) => {
    const options = [
        {
            id: 'ingreso',
            label: 'Ingreso',
            icon: TrendingUp,
            color: 'bg-emerald-500',
            description: 'Salario, ventas, extras...'
        },
        {
            id: 'gasto',
            label: 'Gasto',
            icon: TrendingDown,
            color: 'bg-rose-500',
            description: 'Compras, pagos, servicios...'
        },
        {
            id: 'ahorro',
            label: 'Ahorro',
            icon: PiggyBank,
            color: 'bg-blue-500',
            description: 'Guardar para el futuro'
        },
        {
            id: 'inversion',
            label: 'Inversión',
            icon: Target,
            color: 'bg-purple-500',
            description: 'Crecer tu patrimonio'
        }
    ] as const;

    return (
        <div className="flex flex-col h-full animate-fade-in p-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-[28px] font-black tracking-tighter">Nueva Transacción</h2>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => onSelect(opt.id)}
                        className="group relative overflow-hidden bg-white dark:bg-[#1C1C1E] p-6 rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm active:scale-95 transition-all text-left flex items-center gap-4 hover:shadow-md"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${opt.color} flex items-center justify-center text-white shadow-lg shadow-gray-200 dark:shadow-none`}>
                            <opt.icon size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[20px] font-black text-gray-900 dark:text-white leading-tight mb-1">{opt.label}</h3>
                            <p className="text-[13px] font-bold text-gray-400 group-hover:text-gray-500 transition-colors">{opt.description}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-white/10 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
