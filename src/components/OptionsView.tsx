import React, { useState } from 'react';
import { Trash2, AlertCircle, ChevronRight, Settings, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import { deleteData } from '../services/firebase';
import { MonthYearPicker } from './MonthYearPicker';

interface OptionsViewProps {
    transactions: any[];
    onClose: () => void;
}

export const OptionsView = ({ transactions, onClose }: OptionsViewProps) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(selectedDate);

    const handleResetMonth = async () => {
        const month = selectedDate.getMonth();
        const year = selectedDate.getFullYear();

        const toDelete = transactions.filter(t => {
            const d = new Date(t.fecha + 'T00:00:00');
            return d.getMonth() === month && d.getFullYear() === year;
        });

        if (toDelete.length === 0) {
            alert("No hay datos para borrar en este mes.");
            return;
        }

        const confirm1 = window.confirm(`¿Estás seguro de que quieres borrar las ${toDelete.length} transacciones de ${monthLabel}?\n\nEsta acción dejará el mes en $0 y no se puede deshacer.`);
        if (!confirm1) return;

        const confirm2 = window.confirm(`¡ÚLTIMA ADVERTENCIA!\n\nSe borrará todo el historial de ingresos, gastos y ahorros de ${monthLabel}. ¿Confirmas?`);
        if (!confirm2) return;

        setIsDeleting(true);
        try {
            // Delete one by one for simplicity (or use batch if needed)
            for (const tx of toDelete) {
                await deleteData("transactions", tx.id);
            }
            alert("Datos restablecidos correctamente.");
        } catch (error) {
            console.error("Error resetting data:", error);
            alert("Ocurrió un error al intentar borrar los datos.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full animate-fade-in px-6 py-8 overflow-y-auto pb-32 no-scrollbar">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-500">
                        <Settings size={22} />
                    </div>
                    <div>
                        <h2 className="text-[28px] font-black tracking-tighter">Opciones</h2>
                        <p className="text-gray-400 font-bold text-[13px]">Configuración de tu cuenta</p>
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                {/* DATA RESET SECTION */}
                <section>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Gestión de Datos</h3>
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <p className="text-[15px] font-bold mb-4">Restablecer Mes</p>
                        <p className="text-[13px] text-gray-400 mb-6 leading-relaxed">
                            Esta opción borrará todos los registros (ingresos, gastos, ahorros e inversiones) del mes seleccionado.
                        </p>

                        <button
                            onClick={() => setShowPicker(true)}
                            className="w-full flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-2xl mb-4 group active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-blue-500" />
                                <span className="font-bold text-[15px] capitalize">{monthLabel}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </button>

                        <button
                            onClick={handleResetMonth}
                            disabled={isDeleting}
                            className="w-full flex items-center justify-center gap-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 p-4 rounded-2xl transition-all active:scale-[0.98] font-black text-[15px]"
                        >
                            {isDeleting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Trash2 size={18} />
                                    <span>Borrar Datos del Mes</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* INFO SECTION */}
                <section className="bg-blue-500/5 rounded-[32px] p-6 border border-blue-500/10">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-blue-600 dark:text-blue-400 mb-1">Dato Importante</p>
                            <p className="text-[12px] text-blue-500/80 leading-relaxed font-semibold">
                                Al borrar un mes, las categorías y presupuestos se mantienen intactos. Solo se eliminan los movimientos registrados.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {showPicker && (
                <MonthYearPicker
                    currentDate={selectedDate}
                    onDateChange={(date) => {
                        setSelectedDate(date);
                        setShowPicker(false);
                    }}
                    onClose={() => setShowPicker(false)}
                />
            )}
        </div>
    );
};
