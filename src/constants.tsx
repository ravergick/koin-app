
import React from 'react';

// --- ICONOS UNIFICADOS ---
export const Icons = {
    Wallet: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1 0-4h14v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
    Card: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    Users: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Bank: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7"/><path d="M19 21V7"/><path d="M4 7h16"/><path d="M9 7v14"/><path d="M15 7v14"/><path d="M2 7l10-5 10 5"/></svg>,
    Cart: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    Ghost: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 22v-2a3 3 0 0 0-3-3H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/></svg>,
    ChevronRight: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
    Trash: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    ArrowRight: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    Plus: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Settings: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    Mic: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    Edit: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Refresh: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>,
    Safe: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="17" cy="7" r="1"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><line x1="12" y1="14" x2="12" y2="17"/></svg>,
    Share: (p: React.SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
};

export const ICON_KEYS = Object.keys(Icons);

// --- PALETA DE COLORES ---
export const PALETTE = [
    '#007AFF', // iOS Blue
    '#34C759', // iOS Green
    '#AF52DE', // iOS Purple
    '#FF3B30', // iOS Red
    '#FF9500', // iOS Orange
    '#5856D6', // iOS Indigo
    '#FF2D55', // iOS Pink
    '#64D2FF', // iOS Sky
];

// --- FORMATEADORES ---
export const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.-]/g, '')) : val;
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
};

// --- COMPONENTES DE UI ---

interface FormattedInputProps {
    value: number | string;
    onChange: (val: number | string) => void;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
    onCalculatorRequest?: () => void;
}

export const FormattedInput: React.FC<FormattedInputProps> = ({ 
    value, onChange, placeholder, className, autoFocus, onCalculatorRequest 
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        onChange(rawValue === '' ? '' : parseInt(rawValue, 10));
    };

    const displayValue = value === '' || value === 0 ? '' : formatCurrency(value);

    return (
        <div className="relative w-full flex items-center">
            <input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                className={className}
                autoFocus={autoFocus}
            />
            {onCalculatorRequest && (
                <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCalculatorRequest(); }}
                    className="absolute right-0 p-2 text-ios-blue active:opacity-50"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
                </button>
            )}
        </div>
    );
};

// --- COMPONENTES DE ANIMACIÓN ---

export const IconAnimCard = () => (
    <div className="w-full h-full flex items-center justify-center text-ios-blue animate-float">
        <Icons.Card className="w-full h-full" />
    </div>
);

export const IconAnimBudget = () => (
    <div className="w-full h-full flex items-center justify-center text-ios-green animate-pulse">
        <Icons.Wallet className="w-full h-full" />
    </div>
);

export const IconAnimExternal = () => (
    <div className="w-full h-full flex items-center justify-center text-ios-purple animate-bounce">
        <Icons.Users className="w-full h-full" />
    </div>
);
