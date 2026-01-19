import React, { useState } from 'react';
import { Icons, FormattedInput, PALETTE, formatCurrency, IconAnimCard, IconAnimBudget, IconAnimExternal } from '../constants';
import { CreditCardCategory } from '../types';

interface OnboardingProps {
    onComplete: (limit: number, pCats: CreditCardCategory[], eCats: CreditCardCategory[], payDay: number, interestRate: number) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [limit, setLimit] = useState<string | number>('');
    const [payDay, setPayDay] = useState<number>(15);
    const [interestRate, setInterestRate] = useState<string>('');
    const [personalCats, setPersonalCats] = useState<CreditCardCategory[]>([]);
    const [externalCats, setExternalCats] = useState<CreditCardCategory[]>([]);
    const [tempName, setTempName] = useState('');
    const [tempBudget, setTempBudget] = useState<string | number>('');
    const [hasBudget, setHasBudget] = useState(false);
    const [hasDebt, setHasDebt] = useState(false);

    // Calculator state for onboarding steps 1 and 2
    const [calcState, setCalcState] = useState<{ isOpen: boolean, target: 'limit' | 'budget' | null, expr: string }>({ isOpen: false, target: null, expr: '' });

    const handleBudgetChange = (val: string | number) => {
        const num = typeof val === 'string' ? Number(val) : val;
        setTempBudget(num);
        if (num > 0 && !hasBudget) setHasBudget(true);
    };

    const handleDebtChange = (val: string | number) => {
        const num = typeof val === 'string' ? Number(val) : val;
        setTempBudget(num);
        if (num > 0 && !hasDebt) setHasDebt(true);
    };

    const openCalculator = (target: 'limit' | 'budget', val: any) => {
        setCalcState({ isOpen: true, target, expr: val ? String(val) : '' });
    };

    const handleCalcPress = (key: string) => {
        if (key === 'C') setCalcState(prev => ({ ...prev, expr: '' }));
        else if (key === 'DEL') setCalcState(prev => ({ ...prev, expr: prev.expr.slice(0, -1) }));
        else if (key === '=') {
            try { setCalcState(prev => ({ ...prev, expr: String(new Function('return ' + prev.expr)()) })); } catch { }
        } else if (key === 'DONE') {
            let res = 0; try { res = new Function('return ' + (calcState.expr || '0'))(); } catch { }
            if (calcState.target === 'limit') setLimit(res);
            else if (calcState.target === 'budget') handleBudgetChange(res);
            setCalcState({ isOpen: false, target: null, expr: '' });
        } else {
            const ops = ['+', '-', '*', '/'];
            const lastChar = calcState.expr.slice(-1);
            if (ops.includes(key) && ops.includes(lastChar)) {
                setCalcState(prev => ({ ...prev, expr: prev.expr.slice(0, -1) + key }));
            } else {
                setCalcState(prev => ({ ...prev, expr: prev.expr + key }));
            }
        }
    };

    const addPersonal = () => {
        if (!tempName) return;
        const id = 'cat_' + Date.now();
        const budgetValue = hasBudget ? (Number(tempBudget) || 0) : 0;
        setPersonalCats([...personalCats, { id, label: tempName, type: 'personal', budget: budgetValue, color: PALETTE[Math.floor(Math.random() * PALETTE.length)], icon: 'Card' }]);
        setTempName(''); setTempBudget(''); setHasBudget(false);
    };

    const addExternal = () => {
        if (!tempName) return;
        const id = 'ext_' + Date.now();
        const initialDebtValue = hasDebt ? (Number(tempBudget) || 0) : 0;
        setExternalCats([...externalCats, { id, label: tempName, type: 'external', color: PALETTE[Math.floor(Math.random() * PALETTE.length)], icon: 'Users', initialDebt: initialDebtValue }]);
        setTempName(''); setTempBudget(''); setHasDebt(false);
    };

    const removePersonal = (id: string) => setPersonalCats(prev => prev.filter(c => c.id !== id));
    const removeExternal = (id: string) => setExternalCats(prev => prev.filter(c => c.id !== id));

    const nextStep = () => {
        if (step === 1 && tempName) addPersonal();
        if (step === 2 && tempName) addExternal();
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const finish = () => {
        let finalExternalCats = [...externalCats];
        if (step === 2 && tempName) {
            const initialDebtValue = hasDebt ? (Number(tempBudget) || 0) : 0;
            finalExternalCats.push({ id: 'ext_' + Date.now(), label: tempName, type: 'external', color: PALETTE[Math.floor(Math.random() * PALETTE.length)], icon: 'Users', initialDebt: initialDebtValue });
        }
        onComplete(Number(limit) || 0, personalCats, finalExternalCats, payDay, Number(interestRate) || 0);
    };

    return (
        <div className="min-h-screen bg-ios-bg dark:bg-ios-darkBg flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
            {step > 0 && <button onClick={prevStep} className="absolute top-12 left-6 flex items-center text-ios-blue font-medium active:opacity-50 transition-opacity z-20"><Icons.ChevronRight className="w-6 h-6 -ml-2 rotate-180" /><span className="text-lg">Atrás</span></button>}

            {step === 0 && (
                <div className="w-full max-w-sm space-y-8 animate-slide-up">
                    <div className="w-32 h-32 mx-auto"><IconAnimCard /></div>
                    <div><h2 className="text-3xl font-bold dark:text-white mb-2 tracking-tight">Bienvenido</h2><p className="text-slate-500">Configura tu tarjeta de crédito</p></div>
                    <div className="space-y-4">
                        <div className="bg-ios-card dark:bg-ios-darkCard p-6 rounded-3xl shadow-sm">
                            <label className="text-xs uppercase text-slate-400 font-bold block mb-2 text-left">Cupo Total</label>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl text-slate-400">$</span>
                                <FormattedInput
                                    value={limit}
                                    onChange={setLimit}
                                    placeholder="0"
                                    className="w-full bg-transparent text-4xl font-bold dark:text-white text-center outline-none"
                                // Calculator removed from step 0 per user request
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-ios-card dark:bg-ios-darkCard p-4 rounded-3xl shadow-sm"><label className="text-xs uppercase text-slate-400 font-bold block mb-1">Día Pago</label><input type="number" min="1" max="31" value={payDay} onChange={e => setPayDay(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-center font-bold dark:text-white outline-none" /></div>
                            <div className="flex-1 bg-ios-card dark:bg-ios-darkCard p-4 rounded-3xl shadow-sm"><label className="text-xs uppercase text-slate-400 font-bold block mb-1">Tasa (%)</label><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="0" className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-center font-bold dark:text-white outline-none" /></div>
                        </div>
                    </div>
                    <button onClick={nextStep} className="w-full bg-ios-blue text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-all">Continuar</button>
                </div>
            )}

            {step === 1 && (
                <div className="w-full max-w-sm space-y-6 animate-slide-up">
                    <div className="w-24 h-24 mx-auto"><IconAnimBudget /></div>
                    <div><h2 className="text-2xl font-bold dark:text-white tracking-tight">Tus gastos</h2><p className="text-slate-500 text-sm mt-2">Crea espacios para organizar tus gastos.</p></div>
                    {personalCats.length > 0 && <div className="overflow-y-auto hide-scrollbar space-y-2 max-h-40">{personalCats.map(c => (<div key={c.id} className="bg-ios-card dark:bg-ios-darkCard p-4 rounded-2xl flex justify-between items-center animate-scale-in shadow-sm"><div className="text-left"><span className="dark:text-white font-bold block">{c.label}</span><span className="text-slate-400 text-xs">{c.budget && c.budget > 0 ? `Tope: ${formatCurrency(c.budget)}` : 'Sin tope'}</span></div><button onClick={() => removePersonal(c.id)} className="text-ios-red p-2 active:opacity-50"><Icons.Trash className="w-5 h-5" /></button></div>))}</div>}
                    <div className="bg-ios-card dark:bg-ios-darkCard rounded-3xl p-5 shadow-sm space-y-4">
                        <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Ej: Mercado, Ropa..." className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 outline-none dark:text-white font-medium" />
                        <div className="flex items-center justify-between p-1"><span className="text-sm font-semibold dark:text-white">¿Asignar presupuesto?</span><button onClick={() => setHasBudget(!hasBudget)} className={`w-12 h-7 rounded-full transition-all relative ${hasBudget ? 'bg-ios-green' : 'bg-slate-200'}`}><div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${hasBudget ? 'left-[22px]' : 'left-0.5'}`} /></button></div>
                        {hasBudget && <FormattedInput value={tempBudget} onChange={handleBudgetChange} placeholder="Monto ($)" className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 outline-none dark:text-white font-mono text-center text-xl" onCalculatorRequest={() => openCalculator('budget', tempBudget)} />}
                        <button onClick={addPersonal} disabled={!tempName} className="w-full bg-ios-blue text-white py-3 rounded-xl font-bold disabled:opacity-30 active:scale-95 transition-all">Agregar</button>
                    </div>
                    <button onClick={nextStep} className="w-full bg-ios-green text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-500/30 active:scale-95 transition-all">Siguiente</button>
                </div>
            )}

            {step === 2 && (
                <div className="w-full max-w-sm space-y-6 animate-slide-up">
                    <div className="w-32 h-20 mx-auto flex items-center justify-center"><IconAnimExternal /></div>
                    <div><h2 className="text-2xl font-bold dark:text-white tracking-tight">Cuentas por cobrar</h2><p className="text-slate-500 text-sm mt-2">Dinero que pagaste por otros y te deben devolver.</p></div>
                    {externalCats.length > 0 && <div className="overflow-y-auto hide-scrollbar space-y-2 max-h-40">{externalCats.map(c => (<div key={c.id} className="bg-ios-card dark:bg-ios-darkCard p-4 rounded-2xl flex justify-between items-center animate-scale-in shadow-sm"><div className="text-left"><span className="font-bold dark:text-white block">{c.label}</span>{c.initialDebt && c.initialDebt > 0 && <span className="text-ios-purple text-xs">Deuda: {formatCurrency(c.initialDebt)}</span>}</div><button onClick={() => removeExternal(c.id)} className="text-ios-red p-2"><Icons.Trash className="w-5 h-5" /></button></div>))}</div>}
                    <div className="p-5 bg-ios-card dark:bg-ios-darkCard rounded-3xl shadow-sm space-y-4">
                        <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Ej: Pareja, Mamá..." className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 outline-none dark:text-white font-medium" />
                        <div className="flex items-center justify-between p-1"><span className="text-sm font-semibold dark:text-white">¿Tiene saldo pendiente?</span><button onClick={() => setHasDebt(!hasDebt)} className={`w-12 h-7 rounded-full transition-all relative ${hasDebt ? 'bg-ios-purple' : 'bg-slate-200'}`}><div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${hasDebt ? 'left-[22px]' : 'left-0.5'}`} /></button></div>
                        {hasDebt && <FormattedInput value={tempBudget} onChange={handleDebtChange} placeholder="Monto deuda ($)" className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 outline-none dark:text-white font-mono text-center text-xl" onCalculatorRequest={() => openCalculator('budget', tempBudget)} />}
                        <button onClick={addExternal} disabled={!tempName} className="w-full bg-ios-purple text-white py-3 rounded-xl font-bold disabled:opacity-30 active:scale-95 transition-all">Agregar Persona</button>
                    </div>
                    <button onClick={finish} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold shadow-xl active:scale-95 flex items-center justify-center gap-2 transition-all">Comenzar <Icons.ArrowRight className="w-5 h-5" /></button>
                </div>
            )}

            {calcState.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => handleCalcPress('DONE')} />
                    <div className="bg-ios-card dark:bg-ios-darkCard w-full max-w-md rounded-t-3xl shadow-2xl p-6 relative z-10 animate-slide-up pb-safe border-t border-slate-200 dark:border-slate-800">
                        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />
                        <div className="bg-slate-100 dark:bg-black p-6 rounded-2xl mb-6 text-right border border-slate-200 dark:border-slate-800"><div className="text-4xl font-mono font-bold dark:text-white truncate">{calcState.expr || '0'}</div></div>
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', 'DEL', '='].map(k => (
                                <button key={k} onClick={() => handleCalcPress(k)} className={`h-16 rounded-2xl text-xl font-bold flex items-center justify-center transition-all active:scale-90 ${['+', '-', '*', '/', 'C', 'DEL', '='].includes(k) ? 'bg-slate-200 dark:bg-slate-800 text-ios-blue' : 'bg-slate-100 dark:bg-slate-900 dark:text-white'}`}>
                                    {k === 'DEL' ? <Icons.Trash className="w-6 h-6" /> : k}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => handleCalcPress('DONE')} className="w-full bg-ios-blue text-white py-5 rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition-all">Confirmar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Onboarding;