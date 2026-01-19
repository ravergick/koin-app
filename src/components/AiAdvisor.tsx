import React, { useState, useMemo } from 'react';
import {
    MessageSquare,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Zap,
    Send,
    Bot
} from 'lucide-react';
import { Transaction, Category } from '../types';

interface Insight {
    title: string;
    desc: string;
    type: 'warning' | 'tip' | 'success' | 'alert';
}

export const AiAdvisor = ({ transactions, categories }: { transactions: Transaction[], categories: Category[], defaultMode: string }) => {
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: "¡Hola! Soy Koin AI. He analizado tus últimos movimientos. ¿En qué puedo ayudarte hoy?" }
    ]);

    const insights = useMemo(() => {
        const list: Insight[] = [];
        const totalGastos = transactions.filter(t => t.tipo === 'gasto').reduce((a, b) => a + b.monto, 0);

        // 1. Gasto vs Presupuesto
        categories.forEach(cat => {
            const gastado = transactions.filter(t => t.categoriaId === cat.id && t.tipo === 'gasto').reduce((a, b) => a + b.monto, 0);
            if (cat.presupuesto && gastado > cat.presupuesto) {
                list.push({
                    title: `Presupuesto excedido: ${cat.nombre}`,
                    desc: `Has gastado $${gastado.toLocaleString()} de un presupuesto de $${cat.presupuesto.toLocaleString()}.`,
                    type: 'alert'
                });
            }
        });

        // 2. Proporción de ahorro
        const ahorroInversion = transactions.filter(t => t.tipo === 'ahorro' || t.tipo === 'inversion').reduce((a, b) => a + b.monto, 0);
        const ingresos = transactions.filter(t => t.tipo === 'ingreso').reduce((a, b) => a + b.monto, 0);

        if (ingresos > 0) {
            const radioAhorro = (ahorroInversion / ingresos) * 100;
            if (radioAhorro < 20) {
                list.push({
                    title: "Aumenta tu ahorro",
                    desc: "Tu tasa de ahorro actual es del " + Math.round(radioAhorro) + "%. Intenta llegar al 20% para una mejor salud financiera.",
                    type: 'tip'
                });
            } else {
                list.push({
                    title: "Excelente tasa de ahorro",
                    desc: "Estás ahorrando el " + Math.round(radioAhorro) + "% de tus ingresos. ¡Sigue así!",
                    type: 'success'
                });
            }
        }

        // Default if empty
        if (list.length === 0) {
            list.push({
                title: "Buen comienzo",
                desc: "Sigue registrando tus movimientos para obtener recomendaciones personalizadas.",
                type: 'tip'
            });
        }

        return list;
    }, [transactions, categories]);

    const handleSend = () => {
        if (!chatInput.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: chatInput }]);
        const userMsg = chatInput.toLowerCase();
        setChatInput("");

        // Simple mock response logic
        setTimeout(() => {
            let response = "Interesante. Basado en tus datos, te recomiendo revisar tu presupuesto de ocio.";
            if (userMsg.includes("ahorro")) response = "Para ahorrar más, podrías automatizar una transferencia el día que recibes tu sueldo.";
            if (userMsg.includes("gasto")) response = "Tus gastos han subido un 5% este mes comparado con el anterior.";
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black overflow-hidden animate-fade-in pb-24">
            <header className="px-5 py-4">
                <h2 className="text-[28px] font-black tracking-tighter">Asesor IA</h2>
                <p className="text-gray-400 font-bold text-[13px]">Inteligencia aplicada a tu dinero</p>
            </header>

            <div className="flex-1 overflow-y-auto px-5 space-y-6 no-scrollbar">

                {/* Insights Section */}
                <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Recomendaciones</h3>
                    <div className="space-y-3">
                        {insights.map((insight, i) => (
                            <div key={i} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm flex gap-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${insight.type === 'alert' ? 'bg-rose-500/10 text-rose-500' :
                                        insight.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                            'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {insight.type === 'alert' ? <AlertCircle size={20} /> : insight.type === 'success' ? <CheckCircle2 size={20} /> : <Zap size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[15px] leading-tight mb-0.5">{insight.title}</h4>
                                    <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium leading-normal">{insight.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Section Mimic */}
                <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Consultas</h3>
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col h-[300px] overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-[20px] text-[13px] font-medium ${m.role === 'user' ? 'bg-[#007AFF] text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200'
                                        }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex gap-2">
                            <input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pregúntame algo..."
                                className="flex-1 bg-white dark:bg-black rounded-full px-4 py-2 text-[13px] outline-none border border-gray-200 dark:border-white/10"
                            />
                            <button onClick={handleSend} className="w-9 h-9 bg-[#007AFF] text-white rounded-full flex items-center justify-center active:scale-95 transition-transform shrink-0">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
