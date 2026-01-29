import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

interface MonthYearPickerProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    onClose: () => void;
}

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Generate years: current year - 5 to current year + 5
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

export const MonthYearPicker = ({ currentDate, onDateChange, onClose }: MonthYearPickerProps) => {
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [isClosing, setIsClosing] = useState(false);

    const handleConfirm = () => {
        setIsClosing(true);
        setTimeout(() => {
            const newDate = new Date(selectedYear, selectedMonth, 1);
            onDateChange(newDate);
            onClose();
        }, 200);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 200);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            <div
                className={`bg-white dark:bg-[#1C1C1E] w-full max-w-md sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl transition-transform duration-300 ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <span className="text-sm font-bold">Cancelar</span>
                    </button>
                    <span className="text-sm font-black uppercase tracking-wider text-gray-500">Seleccionar Fecha</span>
                    <button onClick={handleConfirm} className="p-2 text-[#007AFF] font-bold text-sm">
                        Confirmar
                    </button>
                </div>

                {/* Picker Columns */}
                <div className="flex h-[250px] relative">
                    {/* Selection Highlight Bar */}
                    <div className="absolute top-1/2 left-0 right-0 h-[40px] -mt-[20px] bg-gray-100 dark:bg-white/5 pointer-events-none border-t border-b border-gray-200 dark:border-white/10" />

                    {/* Months Column */}
                    <div className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[105px]">
                        {MONTHS.map((m, i) => (
                            <div
                                key={m}
                                onClick={() => setSelectedMonth(i)}
                                className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-all duration-200 ${selectedMonth === i ? 'font-black text-gray-900 dark:text-white scale-110' : 'text-gray-400 font-medium scale-95 opacity-50'}`}
                            >
                                {m}
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-[1px] bg-gray-100 dark:bg-white/5 my-4" />

                    {/* Years Column */}
                    <div className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[105px]">
                        {YEARS.map((y) => (
                            <div
                                key={y}
                                onClick={() => setSelectedYear(y)}
                                className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-all duration-200 ${selectedYear === y ? 'font-black text-gray-900 dark:text-white scale-110' : 'text-gray-400 font-medium scale-95 opacity-50'}`}
                            >
                                {y}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
