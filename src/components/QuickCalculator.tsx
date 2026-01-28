import React, { useState } from 'react';
import { Delete, X } from 'lucide-react';

interface QuickCalculatorProps {
    onResult: (val: number) => void;
    onClose: () => void;
    initialValue?: number;
}

export const QuickCalculator = ({ onResult, onClose, initialValue = 0 }: QuickCalculatorProps) => {
    const [display, setDisplay] = useState(initialValue ? initialValue.toString() : '0');
    const [expression, setExpression] = useState('');

    const handlePress = (val: string) => {
        if (display === '0' && val !== '.') {
            setDisplay(val);
        } else {
            setDisplay(prev => prev + val);
        }
    };

    const handleOp = (op: string) => {
        setExpression(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const calculate = () => {
        try {
            const fullExpr = expression + display;
            // Basic safety check before eval-like behavior, though we control inputs
            // Using Function constructor is safer than direct eval for simple math
            const result = new Function('return ' + fullExpr.replace(/[^-()\d/*+.]/g, ''))();
            setDisplay(result.toString());
            setExpression('');
            return result;
        } catch (e) {
            setDisplay('Error');
            return 0;
        }
    };

    const handleConfirm = () => {
        const res = expression ? calculate() : parseFloat(display);
        onResult(Number(res));
        onClose();
    };

    const clear = () => {
        setDisplay('0');
        setExpression('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-[320px] rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in">
                <div className="bg-gray-100 dark:bg-white/5 p-6 text-right relative">
                    <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-gray-200 dark:bg-white/10 rounded-full text-gray-500"><X size={16} /></button>
                    <div className="text-gray-400 text-sm h-5">{expression}</div>
                    <div className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter overflow-x-auto no-scrollbar">{display}</div>
                </div>
                <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 dark:bg-black/20">
                    {['C', '/', '*', 'DEL'].map(btn => (
                        <button key={btn} type="button" onClick={() => {
                            if (btn === 'C') clear();
                            else if (btn === 'DEL') setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                            else handleOp(btn);
                        }} className="h-16 rounded-[1.2rem] font-bold text-lg bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white active:scale-95 transition-transform flex items-center justify-center">
                            {btn === 'DEL' ? <Delete size={20} /> : btn}
                        </button>
                    ))}
                    {['7', '8', '9', '-'].map(btn => (
                        <button key={btn} type="button" onClick={() => ['-'].includes(btn) ? handleOp(btn) : handlePress(btn)} className={`h-16 rounded-[1.2rem] font-bold text-lg active:scale-95 transition-transform ${['-'].includes(btn) ? 'bg-orange-500 text-white' : 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm'}`}>
                            {btn}
                        </button>
                    ))}
                    {['4', '5', '6', '+'].map(btn => (
                        <button key={btn} type="button" onClick={() => ['+'].includes(btn) ? handleOp(btn) : handlePress(btn)} className={`h-16 rounded-[1.2rem] font-bold text-lg active:scale-95 transition-transform ${['+'].includes(btn) ? 'bg-orange-500 text-white' : 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm'}`}>
                            {btn}
                        </button>
                    ))}
                    {['1', '2', '3', '='].map(btn => (
                        <button key={btn} type="button" onClick={() => btn === '=' ? handleConfirm() : handlePress(btn)} className={`h-16 rounded-[1.2rem] font-bold text-lg active:scale-95 transition-transform ${btn === '=' ? 'bg-[#007AFF] text-white' : 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm'}`}>
                            {btn}
                        </button>
                    ))}
                    <div className="col-span-4 grid grid-cols-4 gap-1">
                        <button type="button" onClick={() => handlePress('0')} className="col-span-2 h-16 rounded-[1.2rem] font-bold text-lg bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm active:scale-95 transition-transform">0</button>
                        <button type="button" onClick={() => handlePress('.')} className="h-16 rounded-[1.2rem] font-bold text-lg bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm active:scale-95 transition-transform">.</button>
                        <button type="button" onClick={clear} className="h-16 rounded-[1.2rem] font-bold text-lg bg-gray-200 dark:bg-white/10 text-gray-500 active:scale-95 transition-transform flex items-center justify-center">C</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
