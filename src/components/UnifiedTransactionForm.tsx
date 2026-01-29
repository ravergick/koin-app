import React, { useState, useEffect } from "react";
import { X, CreditCard, Banknote, Landmark, Smartphone, Users, Calculator, Loader2, Plus, GripVertical, ChevronRight, ShoppingBag, Car, Home, Utensils, Heart, Zap, Coffee, Gift, Music, Plane, GraduationCap, Briefcase, DollarSign, Trash2, Dumbbell, Shirt, Film, Gamepad2, BookOpen, Pill, Bus, Fuel } from 'lucide-react';
import { CurrencyInput } from "./CurrencyInput";
import { QuickCalculator } from "./QuickCalculator";
import { addData, auth, db, subscribeToCollection, deleteData, updateData } from "../services/firebase";
import { doc, onSnapshot, writeBatch } from "firebase/firestore";
import { Category, CreditCardCategory, Contact } from "../types";

const ICON_MAP: Record<string, any> = {
    ShoppingBag, Car, Home, Utensils, Heart, Zap, Coffee, Gift, Music, Plane, GraduationCap, Briefcase, DollarSign, Dumbbell, Shirt, Film, Gamepad2, BookOpen, Pill, Bus, Fuel
};

const getCategoryStyle = (name: string) => {
    const n = name.toLowerCase();

    // Transport / Auto
    if (n.match(/(gasolina|combustible|peaje|auto|coche|carro|mecanico|parking|estacionamiento|uber|taxi|bus|transporte|metro|tren|avion|vuelo|viaje)/)) return { icon: 'Car', color: '#F87171' }; // Red - Generic Car for now, or split

    if (n.match(/(casa|alquiler|hipoteca|arriendo|mantenimiento|hogar|mueble)/)) return { icon: 'Home', color: '#60A5FA' }; // Blue
    if (n.match(/(luz|agua|gas|internet|wifi|celular|telefono|servicios)/)) return { icon: 'Zap', color: '#FACC15' }; // Yellow

    // Food
    if (n.match(/(comida|restaurante|almuerzo|cena|desayuno|delivery|uber eats|pedidos)/)) return { icon: 'Utensils', color: '#F472B6' }; // Pink
    if (n.match(/(super|mercado|compras|despensa|agua)/)) return { icon: 'ShoppingBag', color: '#34D399' }; // Emerald
    if (n.match(/(cafe|starbucks|merienda)/)) return { icon: 'Coffee', color: '#B45309' }; // Brown

    // Health
    if (n.match(/(salud|medico|farmacia|medicamento|pastillas|hospital|doctor|dentista)/)) return { icon: 'Pill', color: '#EF4444' }; // Red
    if (n.match(/(gym|gimnasio|deporte|futbol|entrenamiento)/)) return { icon: 'Dumbbell', color: '#A78BFA' }; // Violet

    // Leisure
    if (n.match(/(cine|pelicula|netflix|hbo|disney|streaming|entradas)/)) return { icon: 'Film', color: '#818CF8' }; // Indigo
    if (n.match(/(juego|game|steam|playstation|xbox|nintendo)/)) return { icon: 'Gamepad2', color: '#6366F1' }; // Indigo
    if (n.match(/(musica|spotify|concierto)/)) return { icon: 'Music', color: '#EC4899' }; // Pink

    // Shopping
    if (n.match(/(ropa|moda|zapatos|accesorios|vestido|camisa)/)) return { icon: 'Shirt', color: '#FB7185' }; // Rose
    if (n.match(/(regalo|donacion|caridad)/)) return { icon: 'Gift', color: '#F43F5E' }; // Rose

    // Education
    if (n.match(/(libros|curso|universidad|colegio|educacion|clases)/)) return { icon: 'BookOpen', color: '#3B82F6' }; // Blue

    // Default
    return { icon: 'ShoppingBag', color: '#9CA3AF' }; // Gray
};


export const UnifiedTransactionForm = ({ categorias, onClose, onSuccess, initialType = 'gasto' }: { categorias: Category[], onClose: () => void, onSuccess: () => void, initialType?: 'gasto' | 'ingreso' | 'ahorro' | 'inversion' }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [creditCards, setCreditCards] = useState<CreditCardCategory[]>([]);

    // Form State
    const [amount, setAmount] = useState<number>(0);
    const [desc, setDesc] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [catId, setCatId] = useState('');
    const [tipo, setTipo] = useState<string>(initialType);
    const [paymentMethod, setPaymentMethod] = useState<string>('cash'); // 'cash', 'debit', 'transfer', or cardId

    // Shared Expense State
    const [isShared, setIsShared] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [debtAmount, setDebtAmount] = useState<number>(0);
    const [showCalculator, setShowCalculator] = useState(false);
    const [newContactName, setNewContactName] = useState('');
    const [isAddingContact, setIsAddingContact] = useState(false);

    // Savings Goal State
    const [isGoalEnabled, setIsGoalEnabled] = useState(false);
    const [goalAmount, setGoalAmount] = useState<number>(0);

    // New Category State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Custom Dropdown State
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    // Fetch user's credit cards and contacts
    useEffect(() => {
        const u = auth.currentUser;
        if (!u) return;

        // Cards
        const unsubCards = onSnapshot(doc(db, "users", u.uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.categories) {
                    const cards = Object.values(data.categories)
                        .filter((c: any) => c.type === 'personal') as CreditCardCategory[];
                    setCreditCards(cards);
                }
            }
        });

        // Contacts (subcollection)
        const unsubContacts = subscribeToCollection("contacts", (data) => setContacts(data as Contact[]));

        return () => { unsubCards(); unsubContacts(); };
    }, []);

    const handleClearCategories = async () => {
        if (!confirm("¿Estás seguro de borrar TODAS las categorías? Esto no se puede deshacer.")) return;
        setIsSubmitting(true);
        try {
            // Since we use a helper that adds to "users/{uid}/collection", we should delete using similar logic
            // But deleting requires iterating.
            for (const c of categorias) {
                await deleteData("categories", c.id);
            }
            // Also reset selection
            setCatId('');
            setIsCategoryOpen(false);
        } catch (e) {
            console.error(e);
            alert("Error al borrar categorías: " + e);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleAddContact = async () => {
        if (!newContactName.trim()) return;
        setIsSubmitting(true);
        await addData("contacts", { name: newContactName, avatar: "👤" });
        setNewContactName('');
        setIsAddingContact(false);
        setIsSubmitting(false);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        setIsSubmitting(true);

        // Smart Style Logic
        const style = getCategoryStyle(newCategoryName);

        const newCat: Omit<Category, 'id'> = {
            nombre: newCategoryName,
            color: style.color,
            iconKey: style.icon,
            tipo: (tipo === 'ahorro' ? 'ahorro' : tipo === 'inversion' ? 'inversion' : 'necesidad') as any
        };
        const ref = await addData("categories", newCat);
        setCatId(ref.id);
        setNewCategoryName('');
        setIsAddingCategory(false);
        setIsSubmitting(false);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Refined validation with specific feedback
        if (!amount || amount <= 0) { alert("Por favor, ingresa un monto mayor a 0"); return; }
        if (tipo !== 'ingreso' && tipo !== 'ahorro' && !catId) { alert("Por favor, selecciona una categoría"); return; }
        if (!desc.trim()) { alert("Por favor, ingresa una descripción"); return; }

        setIsSubmitting(true);
        const u = auth.currentUser;
        if (!u) {
            alert("No se detectó una sesión activa. Por favor, inicia sesión.");
            setIsSubmitting(false);
            return;
        }

        try {

            const batch = writeBatch(db);
            const mainTxId = Date.now().toString();
            // 1. Create Main Transaction
            const txData: any = {
                monto: amount,
                description: desc,
                categoriaId: catId || (tipo === 'ingreso' ? 'general_income' : 'general_savings'), // Default if empty
                fecha: date,
                tipo,
                paymentMethod: paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'debit' ? 'Débito' : paymentMethod === 'transfer' ? 'Transferencia' : 'Tarjeta de Crédito',
                relatedCardId: (paymentMethod !== 'cash' && paymentMethod !== 'debit' && paymentMethod !== 'transfer') ? paymentMethod : null,
                isShared: isShared,
            };

            // If shared, add details
            if (isShared && selectedContactId && debtAmount > 0) {
                // We create a "Receivable" (Cuentas por cobrar)
                const receivableId = Date.now().toString(); // Use a simplified ID strategy
                const receivableRef = doc(db, "users", u.uid, "receivables", receivableId);
                const contact = contacts.find(c => c.id === selectedContactId);

                batch.set(receivableRef, {
                    id: receivableId,
                    amount: debtAmount,
                    status: 'pending',
                    contactId: selectedContactId,
                    contactName: contact?.name || 'Desconocido',
                    description: `Parte de: ${desc}`,
                    date: date
                });

                txData.relatedReceivableId = receivableId;
            }

            // Save Main Tx
            await addData("transactions", txData);

            // Update Category Goal if applicable
            if (tipo === 'ahorro' && isGoalEnabled && catId && goalAmount > 0) {
                await updateData("categories", catId, { targetAmount: goalAmount });
            }

            // 2. If Credit Card, add to card transactions
            if (tipo === 'gasto' && creditCards.find(c => c.id === paymentMethod)) {

                const cardTxData = {
                    id: Date.now() + 1, // slight offset
                    amount: amount,
                    category: paymentMethod, // The Card ID
                    date: new Date().toISOString(),
                    desc: desc,
                    isHiddenFromMain: true,
                    tipo: 'system_credit_debt_log' // This will make it ignored by main app's 'gasto' filter
                };
                await addData("transactions", cardTxData);
            }

            onSuccess();
        } catch (err) {
            console.error(err);
            alert("Error al guardar");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-10">
            {/* Quick Calculator Modal */}
            {showCalculator && (
                <QuickCalculator
                    initialValue={debtAmount}
                    onResult={(val) => setDebtAmount(val)}
                    onClose={() => setShowCalculator(false)}
                />
            )}

            {/* 1. AMOUNT */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                    <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">$</span>
                    <CurrencyInput
                        value={amount}
                        onChange={(val: string) => setAmount(Number(val))}
                        name="monto"
                        required
                        className="text-6xl font-black bg-transparent text-left outline-none w-auto max-w-[280px] placeholder-gray-200 tracking-tighter text-gray-900 dark:text-white placeholder:text-gray-200"
                        placeholder="0"
                    />
                </div>
                <p className="text-xs font-bold uppercase text-gray-400 mt-2">
                    {tipo}
                </p>
            </div>

            {/* 2. PAYMENT METHOD (Only for Expenses) */}
            {tipo === 'gasto' && (
                <div className="flex gap-2 justify-center pb-6">
                    {[
                        { id: 'credit', icon: CreditCard, label: 'Crédito', color: 'bg-fuchsia-500' },
                        { id: 'transfer', icon: Landmark, label: 'Transf.', color: 'bg-orange-500' },
                        { id: 'debit', icon: Smartphone, label: 'Débito', color: 'bg-blue-500' },
                        { id: 'cash', icon: Banknote, label: 'Efectivo', color: 'bg-emerald-500' }
                    ].map(m => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                                if (m.id === 'credit') {
                                    setPaymentMethod(creditCards.length > 0 ? creditCards[0].id : 'credit');
                                } else {
                                    setPaymentMethod(m.id);
                                }
                            }}
                            className={`flex flex-col items-center gap-1 p-3 rounded-2xl w-20 transition-all duration-300 ${(paymentMethod === m.id || (m.id === 'credit' && creditCards.find(c => c.id === paymentMethod)))
                                ? `${m.color} text-white shadow-lg shadow-black/10 scale-110 -translate-y-1`
                                : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                                }`}
                        >
                            <m.icon size={20} strokeWidth={2.5} />
                            <span className="text-[9px] font-bold uppercase">{m.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* CUSTOM CATEGORY SELECTOR */}
            {tipo !== 'ingreso' && (
                <div className="relative z-20 mt-4 px-2">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tipo === 'inversion' ? 'Activo' : tipo === 'ahorro' ? 'Destino' : 'Categoría'}</label>
                    </div>

                    {isAddingCategory && (
                        <div className="flex items-center gap-2 mb-3 animate-scale-in">
                            <input
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                                className="flex-1 h-[54px] px-5 rounded-[24px] bg-white dark:bg-[#1C1C1E] border-2 border-blue-500 outline-none font-bold text-sm shadow-xl shadow-blue-500/10"
                                placeholder="Nombre..."
                                autoFocus
                            />
                            <button type="button" onClick={handleAddCategory} className="px-5 h-[54px] rounded-[24px] bg-[#007AFF] text-white font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">Crear</button>
                            <button type="button" onClick={() => setIsAddingCategory(false)} className="w-[54px] h-[54px] rounded-[24px] bg-gray-100 dark:bg-white/10 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={18} /></button>
                        </div>
                    )}

                    {/* Main Selection Button */}
                    <button
                        type="button"
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className={`w-full bg-white dark:bg-[#1C1C1E] p-2 rounded-[60px] flex items-center justify-between border transition-all duration-300 shadow-sm active:scale-[0.98] ${isCategoryOpen ? 'ring-2 ring-blue-500 border-transparent' : 'border-dashed border-gray-300 dark:border-gray-700'}`}
                        style={{ minHeight: '70px' }}
                    >
                        <div className="flex items-center gap-4 pl-4">
                            {catId && categorias.find(c => c.id === catId) ? (
                                <>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md relative overflow-hidden" style={{ backgroundColor: categorias.find(c => c.id === catId)?.color }}>
                                        {(() => {
                                            const cat = categorias.find(c => c.id === catId);
                                            const Icon = (cat?.iconKey && ICON_MAP[cat.iconKey]) ? ICON_MAP[cat.iconKey] : ShoppingBag;
                                            return <Icon size={20} />;
                                        })()}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-black text-[18px] text-gray-900 dark:text-white leading-none">{categorias.find(c => c.id === catId)?.nombre}</span>
                                    </div>
                                </>
                            ) : (
                                <span className="font-bold text-[18px] text-gray-400 pl-2">Selecciona una categoría</span>
                            )}
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${catId ? 'bg-gray-100 text-gray-400' : 'bg-[#007AFF] text-white shadow-lg shadow-blue-500/30'}`}>
                            <ChevronRight size={24} strokeWidth={3} className={`transition-transform duration-300 ${isCategoryOpen ? 'rotate-90' : ''}`} />
                        </div>
                    </button>

                    {/* Dropdown Content */}
                    {isCategoryOpen && (
                        <div className="mt-4 p-4 bg-white dark:bg-[#1C1C1E] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl animate-in slide-in-from-top-4 fade-in duration-300">
                            <div className="grid grid-cols-3 gap-3">
                                {/* 1. CREATE NEW BUTTON (First Item) */}
                                <button
                                    type="button"
                                    onClick={() => { setIsAddingCategory(true); setIsCategoryOpen(false); }}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-white/5 group border border-dashed border-gray-300 dark:border-gray-700"
                                >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <Plus size={20} strokeWidth={3} />
                                    </div>
                                    <span className="text-[11px] font-bold text-center leading-tight text-gray-400 group-hover:text-blue-500">Crear Nueva</span>
                                </button>

                                {/* Categories List */}
                                {Array.from(new Map(categorias.filter(c => tipo === 'gasto' ? (c.tipo === 'necesidad' || c.tipo === 'deseo') : c.tipo === tipo).map(c => [c.nombre.toLowerCase(), c])).values()).map(c => {
                                    const Icon = (c.iconKey && ICON_MAP[c.iconKey]) ? ICON_MAP[c.iconKey] : ShoppingBag;

                                    // Long Press Logic
                                    const handleStart = () => {
                                        const timer = setTimeout(() => {
                                            if (confirm(`¿Eliminar categoría "${c.nombre}"?`)) {
                                                deleteData("categories", c.id).then(() => {
                                                    if (catId === c.id) setCatId('');
                                                });
                                            }
                                        }, 600); // 600ms for long press
                                        (window as any)[`timer_${c.id}`] = timer;
                                    };

                                    const handleEnd = (e: any) => {
                                        if ((window as any)[`timer_${c.id}`]) {
                                            clearTimeout((window as any)[`timer_${c.id}`]);
                                            delete (window as any)[`timer_${c.id}`];
                                            // Ensure it's not a scroll or drag?
                                            // Simple check: if event wasn't cancelled by long press logic (which implies alert block), we select.
                                            // But alert blocks execution? confirm() blocks. 
                                            // If confirm happened, we don't select.
                                            // If confirm didn't happen, we select.
                                            // But setTimeout runs async. 
                                            // If we release BEFORE 600ms, we select.
                                            setCatId(c.id);
                                            setIsCategoryOpen(false);
                                        }
                                    };

                                    // We need to prevent onClick if long press triggered.
                                    // Actually separating click and long press cleanly needs state.
                                    // Simplified Approach:
                                    // Use onPress/onClick for selection, but prevent it if long press fired?
                                    // Better: Don't use onClick. Use MouseUp/TouchEnd to trigger select ONLY if long press didn't fire.

                                    return (
                                        <CategoryItem
                                            key={c.id}
                                            category={c}
                                            isSelected={catId === c.id}
                                            onSelect={() => { setCatId(c.id); setIsCategoryOpen(false); }}
                                            onDelete={() => deleteData("categories", c.id)}
                                            Icon={Icon}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* DESCRIPTION FIELD (Moved here) */}
            <div className="px-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 mb-1 block tracking-wider">
                    {tipo === 'gasto' ? 'Descripción' : tipo === 'ahorro' ? 'Descripción del ahorro' : 'Concepto'}
                </label>
                <input
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-[#1C1C1E] p-5 rounded-[24px] outline-none font-bold text-[18px] border border-gray-100 dark:border-white/5 shadow-sm focus:border-blue-500/50 transition-colors"
                    placeholder={tipo === 'ingreso' ? "Ej: Salario, Venta..." : tipo === 'ahorro' ? "Ej: Bicicleta, Comedor, Televisor..." : "Ej: Almuerzo, Uber, Ropa..."}
                    autoComplete="off"
                />
            </div>



            {/* 3. SHARED SWITCH (Only for Expenses) */}
            {tipo === 'ahorro' && (
                <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 mx-2 mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 text-blue-500 p-2.5 rounded-2xl"><Landmark size={20} /></div>
                            <span className="font-bold text-sm">Definir Presupuesto / Meta</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsGoalEnabled(!isGoalEnabled)}
                            className={`w-14 h-8 rounded-full transition-all duration-300 relative ${isGoalEnabled ? 'bg-blue-500 shadow-blue-500/30 shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${isGoalEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {isGoalEnabled && (
                        <div className="mt-3 animate-scale-in">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wide block mb-1">Valor Meta</label>
                            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-2xl">
                                <span className="text-xl font-black text-blue-500">$</span>
                                <CurrencyInput
                                    value={goalAmount}
                                    onChange={(val: string) => setGoalAmount(Number(val))}
                                    className="w-full bg-transparent font-black text-xl text-blue-900 dark:text-blue-100 outline-none placeholder-blue-300"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tipo === 'gasto' && (
                <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[24px] flex items-center justify-between border border-gray-100 dark:border-white/5 mx-2 mt-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/10 text-indigo-500 p-2.5 rounded-2xl"><Users size={20} /></div>
                        <span className="font-bold text-sm">Gasto Compartido</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsShared(!isShared)}
                        className={`w-14 h-8 rounded-full transition-all duration-300 relative ${isShared ? 'bg-indigo-500 shadow-indigo-500/30 shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${isShared ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            )}

            {/* 4. SHARED LOGIC */}
            {tipo === 'gasto' && isShared && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-[28px] mx-2 space-y-4 animate-scale-in border border-indigo-100 dark:border-indigo-500/20">
                    <div>
                        <div className="flex justify-between items-center mb-2 px-1">
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Compartir con:</span>
                            <button type="button" onClick={() => setIsAddingContact(true)} className="text-xs font-bold text-indigo-500 flex items-center gap-1 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-1 rounded-lg">+ Nuevo</button>
                        </div>

                        {isAddingContact && (
                            <div className="flex gap-2 mb-3">
                                <input
                                    value={newContactName}
                                    onChange={e => setNewContactName(e.target.value)}
                                    placeholder="Nombre..."
                                    className="flex-1 bg-white dark:bg-black/20 px-3 py-3 rounded-xl text-sm font-bold border-none outline-none"
                                    autoFocus
                                />
                                <button type="button" onClick={handleAddContact} className="bg-indigo-500 text-white px-4 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20">OK</button>
                            </div>
                        )}

                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
                            {contacts.map(c => (
                                <ContactItem
                                    key={c.id}
                                    contact={c}
                                    isSelected={selectedContactId === c.id}
                                    onSelect={() => setSelectedContactId(c.id)}
                                    onDelete={() => deleteData("contacts", c.id)}
                                    onEdit={(newName: string) => updateData("contacts", c.id, { name: newName })}
                                />
                            ))}
                            {contacts.length === 0 && !isAddingContact && <span className="text-xs text-gray-400 italic py-2">No tienes contactos aún.</span>}
                        </div>
                    </div>

                    {selectedContactId && (
                        <div className="flex items-end gap-3 bg-white dark:bg-black/20 p-4 rounded-[24px] border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-indigo-400 uppercase mb-1 block tracking-wide">¿Cuánto te deben?</label>
                                <div className="flex items-center gap-1">
                                    <span className="text-2xl font-black text-indigo-900 dark:text-indigo-200 tracking-tighter">$</span>
                                    <CurrencyInput
                                        value={debtAmount}
                                        onChange={(val: string) => setDebtAmount(Number(val))}
                                        className="w-full bg-transparent font-black text-3xl text-indigo-900 dark:text-white outline-none placeholder-indigo-200 tracking-tighter"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCalculator(true)}
                                className="bg-indigo-500 text-white p-3 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-indigo-500/20"
                            >
                                <Calculator size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* DATE SECTION */}
            <div className="space-y-4 px-2">

                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 mb-1 block tracking-wider">Fecha</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-white dark:bg-[#1C1C1E] p-5 rounded-[24px] font-bold text-[16px] border border-gray-100 dark:border-white/5 shadow-sm"
                    />
                </div>
            </div>


            <button type="submit" disabled={isSubmitting} className={`w-full text-white py-5 rounded-[24px] text-[17px] font-black shadow-lg active:scale-95 transition-all mt-4 ${tipo === 'ingreso' ? 'bg-emerald-500 shadow-emerald-500/20' :
                tipo === 'ahorro' ? 'bg-blue-500 shadow-blue-500/20' :
                    tipo === 'inversion' ? 'bg-purple-500 shadow-purple-500/20' :
                        'bg-[#007AFF] shadow-blue-500/20'
                }`}>
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> :
                    tipo === 'ingreso' ? "Registrar Ingreso" :
                        tipo === 'ahorro' ? "Guardar Ahorro" :
                            "Guardar Transacción"}
            </button>

            <button type="button" onClick={onClose} className="w-full py-2 text-gray-400 font-bold text-[13px]">Cancelar</button>
        </form>
    );
};

const CategoryItem = ({ category, isSelected, onSelect, onDelete, Icon }: any) => {
    const [isPressed, setIsPressed] = useState(false);
    const timerRef = React.useRef<any>(null);

    const start = () => {
        setIsPressed(true);
        timerRef.current = setTimeout(() => {
            if (confirm(`¿Eliminar la categoría "${category.nombre}"?`)) {
                onDelete();
            }
            setIsPressed(false);
            timerRef.current = null;
        }, 600);
    };

    const end = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
            if (isPressed) {
                onSelect();
            }
        }
        setIsPressed(false);
    };

    return (
        <button
            type="button"
            onTouchStart={start}
            onTouchEnd={end}
            onMouseDown={start}
            onMouseUp={end}
            onMouseLeave={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                setIsPressed(false);
            }}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 select-none ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : 'hover:bg-gray-50 dark:hover:bg-white/5'} ${isPressed ? 'scale-95 opacity-80' : ''}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-transform ${isPressed ? 'scale-90' : ''}`} style={{ backgroundColor: category.color }}>
                <Icon size={18} />
            </div>
            <span className="text-[11px] font-bold text-center leading-tight line-clamp-2 text-gray-700 dark:text-gray-300 pointer-events-none select-none">{category.nombre}</span>
        </button>
    );
};

// Helper component for Contact Long Press
const ContactItem = ({ contact, isSelected, onSelect, onDelete, onEdit }: any) => {
    const [timer, setTimer] = useState<any>(null);

    const handleStart = () => {
        setTimer(setTimeout(() => {
            const action = window.confirm(`¿Qué quieres hacer con ${contact.name}?\n\nOK -> Editar\nCancelar -> Eliminar`);
            if (action) {
                const newName = prompt("Nuevo nombre:", contact.name);
                if (newName) onEdit(newName);
            } else {
                if (window.confirm(`¿Borrar a ${contact.name}?`)) onDelete();
            }
        }, 800));
    };

    const handleEnd = () => {
        if (timer) clearTimeout(timer);
    };

    return (
        <button
            type="button"
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            onClick={onSelect}
            className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-2xl transition-all w-20 ${isSelected ? 'bg-indigo-500 text-white shadow-md' : 'bg-white dark:bg-black/20 text-gray-500'}`}
        >
            <div className="text-2xl mb-1">{contact.avatar || '👤'}</div>
            <span className="text-[10px] font-bold line-clamp-1 text-center">{contact.name}</span>
        </button>
    );
};
