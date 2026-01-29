import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Gamepad2, Smartphone, Monitor, Car, Home, Plane, GraduationCap, ShieldCheck, Landmark, Briefcase, Shirt, Utensils, ShoppingBag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Category } from '../../types';
import { updateData } from '../../services/firebase';

interface SavingsInlineDetailProps {
    transactions: any[];
    total: number;
    categories: Category[];
}

const ICON_MAP: Record<string, any> = {
    ShoppingBag, Car, Home, Utensils, Shirt, Gamepad2, Plane, GraduationCap, Briefcase, Landmark, ShieldCheck
};

export const SavingsInlineDetail = ({ transactions, total, categories }: SavingsInlineDetailProps) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Group by category
    const chartData = React.useMemo(() => {
        const stats: Record<string, { value: number; color: string; name: string; target: number, id: string, cat: Category | null, txs: any[], latestDesc: string }> = {};

        // Sort transactions by date desc first to get latest easily
        const sortedTxs = [...transactions].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        sortedTxs.forEach(t => {
            const cat = categories.find(c => c.id === t.categoriaId);
            const name = cat ? cat.nombre : 'General';
            const color = cat ? cat.color : '#3B82F6'; // Blue default
            // Ensure target is treated as number
            const target = cat && cat.targetAmount ? Number(cat.targetAmount) : 0;
            const id = cat ? cat.id : 'general';

            if (!stats[name]) stats[name] = { value: 0, color, name, target, id, cat: cat || null, txs: [], latestDesc: t.description };
            stats[name].value += t.monto;
            stats[name].txs.push(t);
        });

        return Object.values(stats)
            .sort((a, b) => b.value - a.value);
    }, [transactions, categories]);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 mb-4 animate-fade-in shadow-sm">

            {/* Header: Title & Legend & Total */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-6">
                    {/* PIE CHART */}
                    <div className="w-[120px] h-[120px] shrink-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={55}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Total Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ahorro Total</h3>
                        <p className="text-3xl font-black text-blue-500 tracking-tighter mb-3">${total.toLocaleString()}</p>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-2">
                            {chartData.slice(0, 4).map((d, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[80px]">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* PROGRESS BARS PER META */}
            <div className="space-y-5">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Tus Metas</h4>

                {chartData.map((cat) => {
                    const progress = cat.target > 0 ? Math.min((cat.value / cat.target) * 100, 100) : 0;
                    const remaining = Math.max(cat.target - cat.value, 0);
                    const isExpanded = expandedId === cat.id;

                    // Smart Icon Logic
                    let Icon = ShoppingBag;
                    const keywords = cat.txs.map(t => t.description.toLowerCase()).join(' ');

                    if (keywords.includes('playstation') || keywords.includes('xbox') || keywords.includes('nintendo') || keywords.includes('ps5') || keywords.includes('juego')) Icon = Gamepad2;
                    else if (keywords.includes('iphone') || keywords.includes('samsung') || keywords.includes('celular') || keywords.includes('movil')) Icon = Smartphone;
                    else if (keywords.includes('macbook') || keywords.includes('laptop') || keywords.includes('computador') || keywords.includes('pc')) Icon = Monitor;
                    else if (keywords.includes('carro') || keywords.includes('moto') || keywords.includes('vehiculo') || keywords.includes('gasolina') || keywords.includes('mantenimiento')) Icon = Car;
                    else if (keywords.includes('casa') || keywords.includes('apartamento') || keywords.includes('hogar') || keywords.includes('arriendo') || keywords.includes('mueble')) Icon = Home;
                    else if (keywords.includes('viaje') || keywords.includes('tiquete') || keywords.includes('avion') || keywords.includes('hotel') || keywords.includes('vacaciones') || keywords.includes('paseo')) Icon = Plane;
                    else if (keywords.includes('universidad') || keywords.includes('matricula') || keywords.includes('curso') || keywords.includes('colegio') || keywords.includes('educacion') || keywords.includes('semestre')) Icon = GraduationCap;
                    else if (keywords.includes('salud') || keywords.includes('medico') || keywords.includes('hospital') || keywords.includes('farmacia') || keywords.includes('seguro')) Icon = ShieldCheck;
                    else if (keywords.includes('banco') || keywords.includes('inversion') || keywords.includes('cdt') || keywords.includes('fiducia') || keywords.includes('acciones')) Icon = Landmark;
                    else if (keywords.includes('ropa') || keywords.includes('zapatos') || keywords.includes('moda') || keywords.includes('camisa') || keywords.includes('pantalon')) Icon = Shirt;
                    else if (keywords.includes('comida') || keywords.includes('restaurante') || keywords.includes('mercado') || keywords.includes('cine') || keywords.includes('salida')) Icon = Utensils;
                    else if (cat.cat?.iconKey && ICON_MAP[cat.cat.iconKey]) Icon = ICON_MAP[cat.cat.iconKey];

                    // Long Press Logic
                    const [isPressed, setIsPressed] = useState(false);
                    const timerRef = React.useRef<any>(null);

                    const startPress = () => {
                        setIsPressed(true);
                        timerRef.current = setTimeout(() => {
                            if (window.confirm(`¿Eliminar la meta de ahorro para "${cat.latestDesc}"?`)) {
                                if (cat.id !== 'general') {
                                    updateData("categories", cat.id, { targetAmount: 0 });
                                }
                            }
                            setIsPressed(false);
                            timerRef.current = null;
                        }, 800);
                    };

                    const endPress = () => {
                        if (timerRef.current) {
                            clearTimeout(timerRef.current);
                            timerRef.current = null;
                            if (isPressed) {
                                toggleExpand(cat.id);
                            }
                        }
                        setIsPressed(false);
                    };

                    const handleMouseLeave = () => {
                        if (timerRef.current) {
                            clearTimeout(timerRef.current);
                            timerRef.current = null;
                        }
                        setIsPressed(false);
                    };

                    return (
                        <div key={cat.id} className={`transition-all duration-300 ${isExpanded ? 'bg-gray-50 dark:bg-white/5 rounded-[24px] p-4 -mx-2' : ''} ${isPressed ? 'scale-95 opacity-80' : ''}`}>
                            <div
                                onTouchStart={startPress}
                                onTouchEnd={endPress}
                                onMouseDown={startPress}
                                onMouseUp={endPress}
                                onMouseLeave={handleMouseLeave}
                                className="flex gap-4 cursor-pointer select-none"
                            >
                                {/* Icon Box */}
                                <div className="w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 transition-transform duration-300" style={{ backgroundColor: `${cat.color}15`, transform: isExpanded ? 'scale(1.1)' : 'scale(1)' }}>
                                    <Icon size={22} color={cat.color} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-center gap-2">
                                    {/* Row 1: Title & Target */}
                                    <div className="flex justify-between items-center leading-none">
                                        {/* TITLE: Description instead of Category Name */}
                                        <h5 className="font-bold text-[15px] text-gray-900 dark:text-white capitalize truncate pr-2">{cat.latestDesc}</h5>
                                        {cat.target > 0 && <span className="font-black text-[15px] text-gray-900 dark:text-white">${cat.target.toLocaleString()}</span>}
                                    </div>

                                    {/* Row 2: Progress Bar */}
                                    <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 ease-out relative"
                                            style={{ width: `${progress}%`, backgroundColor: cat.color }}
                                        >
                                            {/* Shimmer effect if 100%? */}
                                            {progress >= 100 && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                                        </div>
                                    </div>

                                    {/* Row 3: Subtitle & % */}
                                    <div className="flex justify-between items-center leading-none mt-0.5">
                                        {/* SUBTITLE: Category Name */}
                                        <span className="text-[11px] font-bold text-gray-400">{cat.name}</span>
                                        {cat.target > 0 ? (
                                            <span className={`text-[11px] font-bold ${progress >= 100 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                Total ahorrado: ${cat.value.toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-400">Sin meta</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* EXPANDED DETAILS */}
                            {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 animate-fade-in">
                                    <h6 className="text-[10px] font-bold text-gray-400 uppercase mb-3 ml-1">Historial recientes</h6>
                                    <div className="space-y-3 pl-1">
                                        {cat.txs.slice(0, 5).map((tx: any) => (
                                            <div key={tx.id} className="flex justify-between items-center text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-700 dark:text-gray-200">{tx.description}</span>
                                                    <span className="text-[9px] text-gray-400">{new Date(tx.fecha).toLocaleDateString()}</span>
                                                </div>
                                                <span className="font-bold text-blue-500">+${tx.monto.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 bg-blue-500/10 rounded-xl p-3 flex justify-between items-center">
                                        <span className="text-xs font-bold text-blue-500">Total Ahorrado Hoy</span>
                                        <span className="text-sm font-black text-blue-500">${cat.value.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {chartData.length === 0 && <p className="text-[10px] text-gray-400 text-center">Sin ahorros activos</p>}
            </div>

        </div>
    );
};
