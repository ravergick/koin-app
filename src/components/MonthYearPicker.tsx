import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthYearPickerProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    onClose: () => void;
}

const MONTHS = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export const MonthYearPicker = ({ currentDate, onDateChange, onClose }: MonthYearPickerProps) => {
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [isClosing, setIsClosing] = useState(false);

    const handleConfirm = (month: number) => {
        const newDate = new Date(selectedYear, month, 1);
        onDateChange(newDate);
        setIsClosing(true);
        setTimeout(onClose, 200);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 200);
    };

    const adjustYear = (n: number) => {
        setSelectedYear(prev => prev + n);
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            <div
                className={`bg-white dark:bg-[#1C1C1E] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} border border-gray-200 dark:border-white/10`}
            >
                {/* Header with Year Selector */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
                    <div className="flex justify-between items-center">
                        <h3 className="flex items-center gap-2 text-[17px] font-black tracking-tight">
                            <Calendar size={18} className="text-[#007AFF]" />
                            Seleccionar mes
                        </h3>
                        <button onClick={handleClose} className="text-gray-400 font-bold text-sm hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                            Cerrar
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-between bg-gray-100/50 dark:bg-white/5 p-2 rounded-2xl border border-gray-200/50 dark:border-white/5">
                        <button
                            onClick={() => adjustYear(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#2C2C2E] shadow-sm active:scale-90 transition-all text-gray-600 dark:text-white"
                        >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>

                        <div className="flex flex-col items-center">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Año</span>
                            <span className="text-[20px] font-black tracking-tight text-[#007AFF]">{selectedYear}</span>
                        </div>

                        <button
                            onClick={() => adjustYear(1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#2C2C2E] shadow-sm active:scale-90 transition-all text-gray-600 dark:text-white"
                        >
                            <ChevronRight size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Grid of Months */}
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-3">
                        {MONTHS.map((m, i) => {
                            const isSelected = selectedMonth === i && selectedYear === currentDate.getFullYear();
                            const isActualSelection = selectedMonth === i;

                            return (
                                <button
                                    key={m}
                                    onClick={() => {
                                        setSelectedMonth(i);
                                        handleConfirm(i);
                                    }}
                                    className={`h-14 rounded-2xl font-bold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 relative overflow-hidden group
                                        ${isActualSelection
                                            ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-500/30 scale-[1.05] z-10'
                                            : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95'}`}
                                >
                                    <span className="text-[15px] font-black tracking-tight">{m}</span>
                                    {isActualSelection && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="px-6 pb-6 pt-2">
                    <p className="text-[11px] text-gray-400 text-center font-semibold bg-gray-50 dark:bg-white/2 py-2 rounded-xl">
                        Toca un mes para cambiar la vista automáticamente
                    </p>
                </div>
            </div>
        </div>
    );
};
