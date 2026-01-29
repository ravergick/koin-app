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
import { CurrencyInput } from "./components/CurrencyInput";
import { CompactHeader } from "./components/CompactHeader";
import { DonutChart } from "./components/DonutChart";
import { FlowChip } from "./components/FlowChip";
import { MainWidget } from "./components/MainWidget";
import { UnifiedTransactionForm } from "./components/UnifiedTransactionForm";
import { TransactionTypeSelector } from "./components/TransactionTypeSelector";
import { Dashboard } from "./components/dashboard/Dashboard";
import { IncomeDetailView } from "./components/dashboard/IncomeDetailView";
import { ExpenseDetailView } from "./components/dashboard/ExpenseDetailView";

// Services
import {
    subscribeToCollection,
    addData,
    deleteData,
    updateData,
    auth,
    onAuthStateChanged,
    loginWithGoogle,
    User,
    db
} from "./services/firebase";
import { cleanupDuplicateCategories } from "./utils/cleanupCategories";

// --- CONSTANTES ---
const ICON_MAP: Record<string, any> = {
    Home, ShoppingBag, PiggyBank, CreditCard, TrendingUp, Landmark, ShieldCheck, HandCoins, Target
};

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
    // GASTOS (Expenses)
    { nombre: "Mercado", iconKey: "ShoppingBag", color: "#10B981", tipo: "necesidad" },
    { nombre: "Ropa", iconKey: "Shirt", color: "#F43F5E", tipo: "deseo" },
    { nombre: "Transporte", iconKey: "Car", color: "#EF4444", tipo: "necesidad" },
    { nombre: "Restaurantes", iconKey: "Utensils", color: "#F97316", tipo: "deseo" },
    { nombre: "Hogar", iconKey: "Home", color: "#3B82F6", tipo: "necesidad" },
    { nombre: "Cuidado personal", iconKey: "Heart", color: "#8B5CF6", tipo: "necesidad" },

    // AHORRO (Savings)
    { nombre: "Tecnologia", iconKey: "Gamepad2", color: "#64748B", tipo: "ahorro" },
    { nombre: "Viajes", iconKey: "Plane", color: "#0EA5E9", tipo: "ahorro" },
    { nombre: "Hogar", iconKey: "Home", color: "#3B82F6", tipo: "ahorro" }, // Shared name, different type
    { nombre: "Vehículo", iconKey: "Car", color: "#EF4444", tipo: "ahorro" },
    { nombre: "Educación", iconKey: "GraduationCap", color: "#4F46E5", tipo: "ahorro" },
    { nombre: "Fondo de auxilio", iconKey: "ShieldCheck", color: "#22C55E", tipo: "ahorro" },
    { nombre: "Bienes raices", iconKey: "Landmark", color: "#D97706", tipo: "ahorro" },
];

// --- HELPER COMPONENTS ---


const parseCurrency = (val: string | null) => val ? parseFloat(val.toString().replace(/\./g, "")) : 0;


// --- APP ---

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [vistaActual, setVistaActual] = useState("overview");
    const [drillDownView, setDrillDownView] = useState<'gastos' | 'ingresos' | 'ahorro' | 'inversion' | 'deudas' | 'cobros' | 'patrimonio' | null>(null);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Transaction Flow State
    const [selectedTxType, setSelectedTxType] = useState<'gasto' | 'ingreso' | 'ahorro' | 'inversion' | null>(null);

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
    const [loadingFlags, setLoadingFlags] = useState({ tx: false, cat: false, debts: false, rec: false });

    useEffect(() => {
        if (loadingFlags.tx && loadingFlags.cat && loadingFlags.debts && loadingFlags.rec) {
            setIsLoading(false);
        }
    }, [loadingFlags]);

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        setLoadingFlags({ tx: false, cat: false, debts: false, rec: false });

        const unsubscribeTx = subscribeToCollection("transactions", (data) => {
            setTransacciones(data as Transaction[]);
            setLoadingFlags(prev => ({ ...prev, tx: true }));
        });

        const unsubscribeCat = subscribeToCollection("categories", (data) => {
            setCategorias(data as Category[]);
            // Initialize defaults if needed (currently DEFAULT_CATEGORIES is empty, but kept logic safe)
            if (data.length === 0 && DEFAULT_CATEGORIES.length > 0) {
                DEFAULT_CATEGORIES.forEach(c => addData("categories", c));
            }
            setLoadingFlags(prev => ({ ...prev, cat: true }));
        });

        const unsubscribeDebts = subscribeToCollection("debts", (data) => {
            setDebts(data as DebtItem[]);
            setLoadingFlags(prev => ({ ...prev, debts: true }));
        });

        const unsubscribeRec = subscribeToCollection("receivables", (data) => {
            setReceivables(data as ReceivableItem[]);
            setLoadingFlags(prev => ({ ...prev, rec: true }));
        });

        // Failsafe: Force stop loading after 4 seconds (in case a collection is empty or slow)
        const safetyTimer = setTimeout(() => {
            setIsLoading(false);
        }, 4000);

        return () => {
            unsubscribeTx(); unsubscribeCat(); unsubscribeDebts(); unsubscribeRec();
            clearTimeout(safetyTimer);
        };
    }, [user]);

    const txDelPeriodo = useMemo(() => transacciones.filter(t => {
        const d = new Date(t.fecha + 'T00:00:00');
        // Filter out system logs like credit card payments or debts logs if they confuse the main cashflow
        // But for Expenses, we want everything except 'system_credit_debt_log' unless we are carefully tracking
        if (t.tipo === 'system_credit_debt_log') return false;
        return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    }), [transacciones, currentMonth]);

    const totalDeuda = debts.reduce((a, b) => a + b.currentBalance, 0);

    // Credit Cards Balance Sum (Mock or Real)
    // We can sum the "used" amount from creditCards categories if we had it, or calculate from TXs?
    // For now, let's assume we don't have a direct "Credit Card Balance" field in user.categories
    // But we might want to sum standard debts + card debts.
    // Let's create a helper to sum card balances if we have that data, otherwise 0.
    const totalTarjetas = 0; // For now. Later we can sum real card balances if available.

    const totalCobros = receivables.filter(r => r.status !== 'paid').reduce((a, b) => a + b.amount, 0);

    // Cashflow Calculation
    const totalIngresos = txDelPeriodo.filter(t => t.tipo === "ingreso").reduce((a, b) => a + b.monto, 0);
    const totalGastos = txDelPeriodo.filter(t => t.tipo === "gasto").reduce((a, b) => a + b.monto, 0);
    const balanceMensual = totalIngresos - totalGastos;

    const totalAhorro = txDelPeriodo.filter(t => {
        const c = categorias.find(cat => cat.id === t.categoriaId);
        return t.tipo === "ahorro" || c?.tipo === "ahorro";
    }).reduce((a, b) => a + b.monto, 0);

    const totalInversion = txDelPeriodo.filter(t => {
        const c = categorias.find(cat => cat.id === t.categoriaId);
        return t.tipo === "inversion" || c?.tipo === "inversion";
    }).reduce((a, b) => a + b.monto, 0);

    const totalActivos = totalAhorro + totalInversion + totalCobros;
    const patrimonioNeto = totalActivos - totalDeuda; // Simplified

    // Stats for Chart
    const statsCategorias = useMemo(() => categorias.map(cat => ({
        ...cat,
        gastado: txDelPeriodo.filter(t => t.categoriaId === cat.id && t.tipo === 'gasto').reduce((a, b) => a + b.monto, 0),
        grupo: cat.tipo
    })), [categorias, txDelPeriodo]);

    const chartData = useMemo(() => {
        // Filter categories with spending > 0
        const activeCategories = statsCategorias.filter(c => c.gastado > 0 && c.grupo !== 'ahorro' && c.grupo !== 'inversion'); // Exclude savings/investments from Expense Chart if they are treated separately

        return activeCategories.map(c => ({
            name: c.nombre,
            value: c.gastado,
            color: c.color
        })).sort((a, b) => b.value - a.value);
    }, [statsCategorias]);


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
                <h1 className="text-4xl font-extrabold mb-2 text-gray-900 dark:text-white tracking-tighter" onDoubleClick={cleanupDuplicateCategories}>Koin</h1>
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
                    <div className="flex-1 flex flex-col h-full animate-fade-in px-5 pt-14 pb-4 overflow-hidden">

                        {/* HEADER */}
                        <div className="mb-4">
                            <CompactHeader currentDate={currentMonth} setDate={setCurrentMonth} privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} />
                        </div>

                        {/* DASHBOARD SCROLLABLE AREA */}
                        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                            <Dashboard
                                monthName={currentMonth.toLocaleString('es-ES', { month: 'long' })}
                                income={totalIngresos}
                                expenses={totalGastos}
                                balance={balanceMensual}
                                distributionData={chartData}
                                savings={totalAhorro}
                                investments={totalInversion}
                                receivables={totalCobros}
                                debts={totalDeuda}
                                creditCardsBalance={totalTarjetas}
                                onNavigate={(view) => {
                                    if (view === 'koin') setVistaActual('koin');
                                    else setDrillDownView(view as any);
                                }}
                                privacyMode={privacyMode}
                                transactions={txDelPeriodo}
                                categories={categorias}
                                debtItems={debts}
                            />
                        </div>
                    </div>
                )}

                {/* Módulo Koin (Tarjetas de Credito) */}
                {vistaActual === "koin" && <TarjetasCredito privacyMode={privacyMode} />}

                {/* Income Detail View */}
                {vistaActual === "overview" && drillDownView === 'ingresos' && (
                    <IncomeDetailView
                        transactions={txDelPeriodo.filter(t => t.tipo === 'ingreso')}
                        categories={categorias}
                        totalIncome={totalIngresos}
                        onBack={() => setDrillDownView(null)}
                        monthName={currentMonth.toLocaleString('es-ES', { month: 'long' }).toUpperCase()}
                    />
                )}

                {/* Expense Detail View */}
                {vistaActual === "overview" && drillDownView === 'gastos' && (
                    <ExpenseDetailView
                        transactions={txDelPeriodo.filter(t => t.tipo === 'gasto')}
                        categories={categorias}
                        totalExpenses={totalGastos}
                        chartData={chartData}
                        onBack={() => setDrillDownView(null)}
                        monthName={currentMonth.toLocaleString('es-ES', { month: 'long' }).toUpperCase()}
                    />
                )}

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

                        {!selectedTxType ? (
                            <TransactionTypeSelector
                                onSelect={(type) => setSelectedTxType(type)}
                                onClose={() => { setSelectedTxType(null); setVistaActual('overview'); }}
                            />
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-[24px] font-black tracking-tighter capitalize">
                                        {selectedTxType === 'gasto' && 'Nuevo Gasto'}
                                        {selectedTxType === 'ingreso' && 'Nuevo Ingreso'}
                                        {selectedTxType === 'ahorro' && 'Nuevo Ahorro'}
                                        {selectedTxType === 'inversion' && 'Nueva Inversión'}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedTxType(null)}
                                        className="text-xs font-bold text-gray-400 uppercase"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                                <UnifiedTransactionForm
                                    initialType={selectedTxType}
                                    categorias={categorias}
                                    onClose={() => { setSelectedTxType(null); setVistaActual('overview'); }}
                                    onSuccess={() => { setSelectedTxType(null); setVistaActual('overview'); }}
                                />
                            </>
                        )}
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
                    <button key={item.id} onClick={() => { setVistaActual(item.id); setDrillDownView(null); setSelectedTxType(null); }} className={`flex flex-col items-center gap-1.5 w-14 transition-colors pt-2 ${vistaActual === item.id ? 'text-[#007AFF]' : 'text-gray-400'}`}>
                        <item.icon size={22} strokeWidth={vistaActual === item.id ? 2.5 : 2} />
                        <span className="text-[10px] font-bold tracking-tight">{item.lbl}</span>
                    </button>
                ))}

                <button onClick={() => { setVistaActual("transactions"); setSelectedTxType(null); }} className="relative -top-7 transform active:scale-90 transition-transform">
                    <div className="w-16 h-16 bg-[#007AFF] rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 text-white border-[6px] border-[#F2F2F7] dark:border-black">
                        <Plus size={30} strokeWidth={3.5} />
                    </div>
                </button>

                {[
                    { id: 'ai-advisor', icon: MessageSquare, lbl: 'Asesor' },
                    { id: 'history', icon: History, lbl: 'Historial' }
                ].map(item => (
                    <button key={item.id} onClick={() => { setVistaActual(item.id); setDrillDownView(null); setSelectedTxType(null); }} className={`flex flex-col items-center gap-1.5 w-14 transition-colors pt-2 ${vistaActual === item.id ? 'text-[#007AFF]' : 'text-gray-400'}`}>
                        <item.icon size={22} strokeWidth={vistaActual === item.id ? 2.5 : 2} />
                        <span className="text-[10px] font-bold tracking-tight">{item.lbl}</span>
                    </button>
                ))}
            </nav>

        </div>
    );
}
