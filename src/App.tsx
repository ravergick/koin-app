import React, { useState, useEffect, useMemo } from "react";
import {
    PiggyBank,
    Plus,
    TrendingUp,
    ShoppingBag,
    MoreHorizontal,
    PieChart,
    History,
    MessageSquare,
    Loader2,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Home,
    ArrowUpCircle,
    ArrowDownCircle,
    HandCoins,
    Landmark,
    ShieldCheck,
    Trash2,
    Target
} from "lucide-react";

// Types
import { Transaction, Category, DebtItem, ReceivableItem } from "./types";

// Components
import { AiAdvisor } from "./components/AiAdvisor";
import { TarjetasCredito } from "./components/TarjetasCredito";

// Services
import {
    subscribeToCollection,
    addData,
    deleteData,
    updateData,
    auth,
    onAuthStateChanged,
    loginWithGoogle,
    User
} from "./services/firebase";

// --- CONSTANTES ---
const ICON_MAP: Record<string, any> = {
    Home, ShoppingBag, PiggyBank, CreditCard, TrendingUp, Landmark, ShieldCheck, HandCoins, Target
};

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
    { nombre: "Vivienda", color: "#6366F1", iconKey: "Home", tipo: "necesidad" },
    { nombre: "Comida", color: "#10B981", iconKey: "ShoppingBag", tipo: "necesidad" },
    { nombre: "Ahorro", color: "#14B8A6", iconKey: "PiggyBank", tipo: "ahorro" },
    { nombre: "Inversiones", color: "#8B5CF6", iconKey: "TrendingUp", tipo: "inversion" },
    { nombre: "Transporte", color: "#F59E0B", iconKey: "CreditCard", tipo: "necesidad" },
    { nombre: "Ocio", color: "#EC4899", iconKey: "Target", tipo: "deseo" },
];

// --- HELPER COMPONENTS ---

const CurrencyInput = ({ value, onChange, placeholder, name, className, required = false }: any) => {
    const [displayValue, setDisplayValue] = useState("");
    useEffect(() => { if (value !== undefined && value !== null) setDisplayValue(formatNumber(value.toString())); }, [value]);
    const formatNumber = (val: string) => val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const handleChange = (e: any) => {
        const raw = e.target.value.replace(/\./g, "");
        if (!/^\d*$/.test(raw)) return;
        setDisplayValue(formatNumber(raw));
        if (onChange) onChange(raw);
    };
    return <input type="text" inputMode="numeric" name={name} value={displayValue} onChange={handleChange} placeholder={placeholder} className={className} required={required} autoComplete="off" />;
};

const parseCurrency = (val: string | null) => val ? parseFloat(val.toString().replace(/\./g, "")) : 0;

const CompactHeader = ({ currentDate, setDate, privacyMode, setPrivacyMode }: any) => {
    const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate);
    const adjust = (n: number) => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + n);
        setDate(d);
    };

    return (
        <header className="flex justify-between items-center px-4 pt-safe h-[48px]">
            <div className="flex items-center bg-gray-200/40 dark:bg-white/5 p-1 rounded-full border border-gray-300/10 backdrop-blur-md">
                <button onClick={() => adjust(-1)} className="w-7 h-7 flex items-center justify-center text-gray-400 active:text-gray-900 dark:active:text-white transition-colors"><ChevronLeft size={14} strokeWidth={3} /></button>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 px-3 min-w-[90px] text-center capitalize tracking-tight">{label}</span>
                <button onClick={() => adjust(1)} className="w-7 h-7 flex items-center justify-center text-gray-400 active:text-gray-900 dark:active:text-white transition-colors"><ChevronRight size={14} strokeWidth={3} /></button>
            </div>

            <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`p-2 rounded-full transition-all active:scale-90 ${privacyMode ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-500/20' : 'bg-gray-200/40 dark:bg-white/5 text-gray-500'}`}
            >
                {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </header>
    );
};

const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    if (total === 0) return (
        <div className="w-40 h-40 mx-auto mb-4 rounded-full border-4 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center">
            <span className="text-gray-400 text-[10px] font-bold">Sin datos</span>
        </div>
    );

    let currentAngle = 0;
    const radius = 35;
    const center = 50;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="relative w-44 h-44 mx-auto mb-4 animate-fade-in">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {data.map((segment, i) => {
                    if (segment.value === 0) return null;
                    const percentage = (segment.value / total) * 100;
                    const dashArray = (percentage / 100) * circumference;
                    const dashOffset = (currentAngle / 100) * circumference;
                    const result = (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${dashArray} ${circumference}`}
                            strokeDashoffset={-dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    );
                    currentAngle += percentage;
                    return result;
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400 tracking-tight">Gastado</span>
                <span className="text-[20px] font-black text-gray-900 dark:text-white">${total.toLocaleString()}</span>
            </div>
        </div>
    );
};

const FlowChip = ({ title, value, type, privacyMode }: any) => {
    const isIncome = type === 'income';
    const color = isIncome ? 'text-emerald-500' : 'text-rose-500';
    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] px-3 py-3.5 flex-1 flex flex-col border border-gray-100 dark:border-white/5 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 mb-0.5 tracking-tight">{title}</span>
            <span className={`text-[18px] font-black tracking-tight ${color} ${privacyMode ? 'blur-md' : ''}`}>
                ${value.toLocaleString()}
            </span>
        </div>
    );
};

const MainWidget = ({ title, value, theme, icon: Icon, onClick, privacyMode }: any) => {
    const CompIcon = Icon;
    const isRed = theme === 'red';
    const colorClass = isRed ? 'text-rose-500' : 'text-emerald-500';
    const bgClass = isRed ? 'bg-rose-500/10' : 'bg-emerald-500/10';

    return (
        <button
            onClick={onClick}
            className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[26px] active:scale-[0.97] transition-all flex flex-col justify-between h-[96px] text-left border border-gray-100 dark:border-white/5 shadow-sm"
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bgClass}`}>
                <CompIcon size={18} className={colorClass} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 mb-0.5 tracking-tight">{title}</p>
                <h3 className={`text-[17px] font-black text-gray-900 dark:text-white leading-none tracking-tight ${privacyMode ? 'blur-sm opacity-20' : ''}`}>
                    ${value.toLocaleString()}
                </h3>
            </div>
        </button>
    );
};

// --- APP ---

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [vistaActual, setVistaActual] = useState("overview");
    const [drillDownView, setDrillDownView] = useState<'gastos' | 'ahorro' | 'inversion' | 'deudas' | 'cobros' | 'patrimonio' | null>(null);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [transacciones, setTransacciones] = useState<Transaction[]>([]);
    const [categorias, setCategorias] = useState<Category[]>([]);
    const [debts, setDebts] = useState<DebtItem[]>([]);
    const [receivables, setReceivables] = useState<ReceivableItem[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    // Listen to Auth State
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (!u) setIsLoading(false);
        });
        return () => unsub();
    }, []);

    // Listen to Data ONLY when user is logged in
    useEffect(() => {
        if (!user) return;
        setIsLoading(true);

        const unsubscribeTx = subscribeToCollection("transactions", (data) => setTransacciones(data as Transaction[]));
        const unsubscribeCat = subscribeToCollection("categories", (data) => {
            if (data.length === 0) DEFAULT_CATEGORIES.forEach(c => addData("categories", c));
            else setCategorias(data as Category[]);
        });
        const unsubscribeDebts = subscribeToCollection("debts", (data) => setDebts(data as DebtItem[]));
        const unsubscribeRec = subscribeToCollection("receivables", (data) => {
            setReceivables(data as ReceivableItem[]);
            setIsLoading(false);
        });
        return () => { unsubscribeTx(); unsubscribeCat(); unsubscribeDebts(); unsubscribeRec(); };
    }, [user]);

    const txDelPeriodo = useMemo(() => transacciones.filter(t => {
        const d = new Date(t.fecha + 'T00:00:00');
        return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    }), [transacciones, currentMonth]);

    const totalDeuda = debts.reduce((a, b) => a + b.currentBalance, 0);
    const totalCobros = receivables.filter(r => r.status !== 'paid').reduce((a, b) => a + b.amount, 0);
    const totalGastos = txDelPeriodo.filter(t => t.tipo === "gasto").reduce((a, b) => a + b.monto, 0);

    const totalAhorro = txDelPeriodo.filter(t => {
        const c = categorias.find(cat => cat.id === t.categoriaId);
        return t.tipo === "ahorro" || c?.tipo === "ahorro";
    }).reduce((a, b) => a + b.monto, 0);

    const totalInversion = txDelPeriodo.filter(t => {
        const c = categorias.find(cat => cat.id === t.categoriaId);
        return t.tipo === "inversion" || c?.tipo === "inversion";
    }).reduce((a, b) => a + b.monto, 0);

    const totalActivos = totalAhorro + totalInversion + totalCobros;
    const patrimonioNeto = totalActivos - totalDeuda;

    const statsCategorias = useMemo(() => categorias.map(cat => ({
        ...cat,
        gastado: txDelPeriodo.filter(t => t.categoriaId === cat.id && (t.tipo === "gasto" || t.tipo === "ahorro" || t.tipo === "inversion")).reduce((a, b) => a + b.monto, 0),
        presupuesto: cat.presupuesto || 0,
        Icon: ICON_MAP[cat.iconKey] || MoreHorizontal,
        grupo: cat.tipo === 'ahorro' ? 'ahorro' : cat.tipo === 'inversion' ? 'inversion' : 'gasto'
    })), [categorias, txDelPeriodo]);

    const distributionData = useMemo(() => [
        { label: 'Necesidades', value: statsCategorias.filter(c => c.tipo === 'necesidad').reduce((a, b) => a + b.gastado, 0), color: '#6366F1' },
        { label: 'Deseos', value: statsCategorias.filter(c => c.tipo === 'deseo').reduce((a, b) => a + b.gastado, 0), color: '#EC4899' },
        { label: 'Ahorro e Inv.', value: statsCategorias.filter(c => c.tipo === 'ahorro' || c.tipo === 'inversion').reduce((a, b) => a + b.gastado, 0), color: '#10B981' },
    ], [statsCategorias]);

    const handleUpdateBudget = async (id: string, monto: number) => {
        await updateData("categories", id, { presupuesto: monto });
    };

    // --- RENDERING ---

    if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-black"><Loader2 className="animate-spin text-[#007AFF]" size={40} /></div>;

    if (!user) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[#F2F2F7] dark:bg-black p-6 text-center animate-fade-in">
                <div className="w-24 h-24 mb-8 bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] shadow-xl flex items-center justify-center text-[#007AFF]">
                    <ShieldCheck size={48} strokeWidth={1.5} />
                </div>
                <h1 className="text-4xl font-extrabold mb-2 text-gray-900 dark:text-white tracking-tighter">Koin</h1>
                <p className="text-gray-500 mb-10 max-w-xs text-sm font-semibold">Tus finanzas, simplificadas.</p>
                <button
                    onClick={loginWithGoogle}
                    className="w-full max-w-sm flex items-center justify-center gap-4 bg-white dark:bg-[#1C1C1E] p-5 rounded-[2rem] shadow-sm active:scale-95 transition-all font-black text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                >
                    {/* Google Icon SVG */}
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="" />
                    Acceder con Google
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#F2F2F7] dark:bg-black text-gray-900 dark:text-gray-100 overflow-hidden font-sans">

            <main className="flex-1 flex flex-col max-w-[480px] mx-auto w-full relative overflow-hidden">

                {vistaActual === "overview" && !drillDownView && (
                    <div className="flex-1 flex flex-col justify-between h-full animate-fade-in px-5 py-4 overflow-hidden no-scrollbar pb-[114px]">

                        <div className="flex flex-col">
                            <CompactHeader currentDate={currentMonth} setDate={setCurrentMonth} privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} />

                            <div className="text-center flex flex-col items-center justify-center py-4">
                                <span className="text-[11px] font-bold text-gray-400 mb-1 tracking-tight opacity-80">Patrimonio neto actual</span>
                                <h1 className={`text-[48px] font-bold tracking-tighter leading-none transition-all duration-700 ${privacyMode ? 'blur-2xl opacity-10' : patrimonioNeto >= 0 ? 'text-gray-900 dark:text-white' : 'text-rose-500'}`}>
                                    {patrimonioNeto < 0 ? '-' : ''}${Math.abs(patrimonioNeto).toLocaleString()}
                                </h1>

                                <div className="flex gap-2 w-full mt-6 px-1">
                                    <FlowChip title="Mi capital" value={totalActivos} type="income" privacyMode={privacyMode} />
                                    <FlowChip title="Mis obligaciones" value={totalDeuda} type="expense" privacyMode={privacyMode} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <h2 className="text-[11px] font-bold text-emerald-500 tracking-tight">Capital</h2>
                                <div className="flex-1 h-[1px] bg-emerald-500/10"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <MainWidget title="Ahorro e inversión" value={totalAhorro + totalInversion} theme="green" icon={PiggyBank} onClick={() => setDrillDownView('ahorro')} privacyMode={privacyMode} />
                                <MainWidget title="Cuentas por cobrar" value={totalCobros} theme="green" icon={HandCoins} onClick={() => setDrillDownView('cobros')} privacyMode={privacyMode} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <h2 className="text-[11px] font-bold text-rose-500 tracking-tight">Obligaciones</h2>
                                <div className="flex-1 h-[1px] bg-rose-500/10"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <MainWidget title="Mis deudas" value={totalDeuda} theme="red" icon={Landmark} onClick={() => setDrillDownView('deudas')} privacyMode={privacyMode} />
                                <MainWidget title="Tarjetas de Crédito" value={0} theme="red" icon={CreditCard} onClick={() => setVistaActual('koin')} privacyMode={privacyMode} />
                            </div>
                        </div>

                    </div>
                )}

                {/* Módulo Koin (Tarjetas de Credito) */}
                {vistaActual === "koin" && <TarjetasCredito privacyMode={privacyMode} />}

                {/* Planificación (Budgets) Compacto */}
                {vistaActual === "budgets" && (
                    <div className="flex-1 flex flex-col h-full animate-fade-in px-5 py-4 overflow-y-auto pb-32 no-scrollbar">
                        <header className="mb-4">
                            <h2 className="text-[28px] font-black tracking-tighter">Tu Plan</h2>
                            <p className="text-gray-400 font-bold text-[13px]">Distribución inteligente del dinero</p>
                        </header>

                        <DonutChart data={distributionData} />

                        <div className="grid grid-cols-3 gap-2 mb-6 px-1">
                            {distributionData.map((d, i) => (
                                <div key={i} className="bg-white dark:bg-[#1C1C1E] p-2 rounded-[18px] flex flex-col items-center border border-gray-100 dark:border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: d.color }}></div>
                                    <span className="text-[9px] font-bold text-gray-400 mb-0.5 tracking-tight text-center">{d.label}</span>
                                    <span className="text-[13px] font-black text-gray-900 dark:text-white">${d.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {statsCategorias.map(cat => {
                                const porcentaje = cat.presupuesto ? (cat.gastado / cat.presupuesto) * 100 : 0;
                                const Icon = cat.Icon;

                                return (
                                    <div key={cat.id} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm active:scale-[0.98] transition-all">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}><Icon size={16} /></div>
                                                <div>
                                                    <h4 className="font-bold text-[15px]">{cat.nombre}</h4>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <button
                                                    onClick={() => {
                                                        const val = prompt("Nuevo presupuesto para " + cat.nombre, cat.presupuesto?.toString());
                                                        if (val) handleUpdateBudget(cat.id, parseInt(val));
                                                    }}
                                                    className="font-black text-[16px] text-[#007AFF] tracking-tight"
                                                >
                                                    ${cat.presupuesto?.toLocaleString() || '0'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${porcentaje > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Drill down views */}
                {vistaActual === "overview" && drillDownView && (
                    <div className="flex-1 overflow-y-auto animate-fade-in px-5 h-full no-scrollbar pb-32">
                        <header className="sticky top-0 z-10 bg-[#F2F2F7]/95 dark:bg-black/95 backdrop-blur-xl py-4 flex items-center justify-between">
                            <button onClick={() => setDrillDownView(null)} className="flex items-center text-[#007AFF] font-bold text-[17px]">
                                <ChevronLeft size={24} /> <span>Atrás</span>
                            </button>
                            <h3 className="font-bold text-[17px] capitalize">{drillDownView === 'deudas' ? 'Mis deudas' : drillDownView === 'gastos' ? 'Gastos del mes' : drillDownView === 'cobros' ? 'Cuentas por cobrar' : 'Activos'}</h3>
                            <div className="w-10"></div>
                        </header>

                        <div className="py-4 space-y-4">
                            {drillDownView === 'deudas' ? (
                                debts.map(d => (
                                    <div key={d.id} className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                            <span className="text-[11px] font-bold text-gray-400 tracking-tight">{d.bank}</span>
                                        </div>
                                        <h4 className="text-[20px] font-bold mb-1">{d.name}</h4>
                                        <div className="flex justify-between items-end">
                                            <p className="text-rose-500 text-[26px] font-black tracking-tighter">${d.currentBalance.toLocaleString()}</p>
                                            <button onClick={() => deleteData("debts", d.id)} className="text-gray-300 p-2"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                statsCategorias.filter(c => drillDownView === 'gastos' ? c.grupo === 'gasto' : c.grupo === drillDownView).map(cat => (
                                    <div key={cat.id} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[24px] flex items-center justify-between border border-gray-100 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}><cat.Icon size={18} /></div>
                                            <span className="font-bold text-[16px]">{cat.nombre}</span>
                                        </div>
                                        <span className="font-black text-[17px] tracking-tight">${cat.gastado.toLocaleString()}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Historial */}
                {vistaActual === "history" && (
                    <div className="flex-1 flex flex-col h-full animate-fade-in px-5 py-4 overflow-y-auto pb-32 no-scrollbar">
                        <header className="mb-4">
                            <h2 className="text-[28px] font-black tracking-tighter">Historial</h2>
                            <p className="text-gray-400 font-bold text-[13px]">Actividad reciente</p>
                        </header>
                        <div className="space-y-3">
                            {transacciones.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(t => {
                                const cat = categorias.find(c => c.id === t.categoriaId);
                                const isIncome = t.tipo === 'ingreso';
                                return (
                                    <div key={t.id} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[22px] flex items-center justify-between border border-gray-100 dark:border-white/5 group active:scale-95 transition-transform">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {isIncome ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[15px] leading-tight">{t.description}</span>
                                                <span className="text-[10px] text-gray-400 font-bold tracking-tight">{cat?.nombre || 'General'} • {t.fecha}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-black text-[16px] tracking-tight ${isIncome ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                                                {isIncome ? '+' : '-'}${t.monto.toLocaleString()}
                                            </span>
                                            <button onClick={() => deleteData("transactions", t.id as string)} className="p-2 text-gray-200"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Registro de Movimiento */}
                {vistaActual === "transactions" && (
                    <div className="flex-1 flex flex-col h-full animate-fade-in px-6 py-4 overflow-y-auto pb-44 no-scrollbar">
                        <h2 className="text-[24px] font-black mb-6 text-center tracking-tighter">Nuevo Registro</h2>
                        <form onSubmit={async (e: any) => {
                            e.preventDefault();
                            setIsSubmitting(true);
                            const fd = new FormData(e.target);
                            const monto = parseCurrency(fd.get("monto") as string);
                            const tipo = fd.get("tipo") as string;
                            await addData("transactions", { monto, description: fd.get("desc"), categoriaId: fd.get("cat"), fecha: fd.get("fecha"), tipo });
                            setVistaActual('overview');
                            setIsSubmitting(false);
                        }} className="space-y-5">
                            <div className="bg-gray-200/40 dark:bg-white/5 p-0.5 rounded-[18px] flex border border-gray-300/10">
                                {['gasto', 'ingreso', 'ahorro', 'inversion'].map(t => (
                                    <label key={t} className="flex-1 text-center cursor-pointer">
                                        <input type="radio" name="tipo" value={t} defaultChecked={t === 'gasto'} className="peer hidden" />
                                        <div className="py-2 rounded-[14px] text-[10px] font-bold text-gray-400 peer-checked:bg-white dark:peer-checked:bg-white/10 peer-checked:text-gray-900 dark:peer-checked:text-white transition-all capitalize tracking-tight">{t}</div>
                                    </label>
                                ))}
                            </div>
                            <div className="text-center py-4">
                                <CurrencyInput name="monto" required className="text-6xl font-black bg-transparent text-center outline-none w-full text-gray-900 dark:text-white placeholder-gray-100 tracking-tighter" placeholder="0" />
                            </div>
                            <div className="space-y-3">
                                <input name="desc" required className="w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-[20px] outline-none font-bold text-[16px] border border-gray-100 dark:border-white/5" placeholder="¿En qué gastaste?" autoComplete="off" />
                                <select name="cat" className="w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-[20px] font-bold text-[16px] border border-gray-100 dark:border-white/5 appearance-none">{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
                                <input name="fecha" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-[20px] font-bold text-[16px] border border-gray-100 dark:border-white/5" />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#007AFF] text-white py-4 rounded-[24px] text-[17px] font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Guardar"}
                            </button>
                            <button type="button" onClick={() => setVistaActual('overview')} className="w-full py-2 text-gray-400 font-bold text-[13px]">Cancelar</button>
                        </form>
                    </div>
                )}

                {/* AI Advisor */}
                {vistaActual === "ai-advisor" && <div className="h-full flex-1"><AiAdvisor transactions={transacciones} categories={categorias} defaultMode={"chat"} /></div>}

            </main>

            {/* --- TAB BAR (iOS Style Floating) --- */}
            <nav className="fixed bottom-0 left-0 right-0 px-6 pb-[env(safe-area-inset-bottom)] pt-2 bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-t border-gray-200/20 dark:border-white/5 z-50 h-[84px] flex justify-between items-start">
                {[
                    { id: 'overview', icon: Home, lbl: 'Inicio' },
                    { id: 'koin', icon: CreditCard, lbl: 'Koin' }
                ].map(item => (
                    <button key={item.id} onClick={() => { setVistaActual(item.id); setDrillDownView(null); }} className={`flex flex-col items-center gap-1.5 w-14 transition-colors pt-2 ${vistaActual === item.id ? 'text-[#007AFF]' : 'text-gray-400'}`}>
                        <item.icon size={22} strokeWidth={vistaActual === item.id ? 2.5 : 2} />
                        <span className="text-[10px] font-bold tracking-tight">{item.lbl}</span>
                    </button>
                ))}

                <button onClick={() => setVistaActual("transactions")} className="relative -top-7 transform active:scale-90 transition-transform">
                    <div className="w-16 h-16 bg-[#007AFF] rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 text-white border-[6px] border-[#F2F2F7] dark:border-black">
                        <Plus size={30} strokeWidth={3.5} />
                    </div>
                </button>

                {[
                    { id: 'ai-advisor', icon: MessageSquare, lbl: 'Asesor' },
                    { id: 'history', icon: History, lbl: 'Historial' }
                ].map(item => (
                    <button key={item.id} onClick={() => { setVistaActual(item.id); setDrillDownView(null); }} className={`flex flex-col items-center gap-1.5 w-14 transition-colors pt-2 ${vistaActual === item.id ? 'text-[#007AFF]' : 'text-gray-400'}`}>
                        <item.icon size={22} strokeWidth={vistaActual === item.id ? 2.5 : 2} />
                        <span className="text-[10px] font-bold tracking-tight">{item.lbl}</span>
                    </button>
                ))}
            </nav>

        </div>
    );
}
