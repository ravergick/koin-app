export interface Transaction {
    id?: string | number; // Support both for now
    monto: number;
    description: string;
    categoriaId: string;
    fecha: string;
    tipo: string;
}

export interface Category {
    id: string;
    nombre: string;
    color: string;
    iconKey: string;
    tipo: 'necesidad' | 'deseo' | 'ahorro' | 'inversion';
    presupuesto?: number;
    gastado?: number; // Computed
    Icon?: any; // Component
    grupo?: string; // Computed
}

export interface DebtItem {
    id: string;
    bank: string;
    name: string;
    currentBalance: number;
}

export interface ReceivableItem {
    id: string;
    amount: number;
    status: 'paid' | 'pending';
    // Add other fields if needed from usage
}

// --- Credit Card Module Types ---

export interface CreditCardCategory {
    id: string;
    label: string;
    type: 'personal' | 'external';
    width?: number; // for UI
    color?: string;
    icon?: string;
    budget?: number;
    initialDebt?: number;
    isShared?: boolean;
}

export interface CreditCardTransaction {
    id: number;
    amount: number;
    category: string;
    date: string;
    desc: string;
}

export interface ModalState {
    type: 'add_cat' | 'add_cat_external' | 'action_expense' | 'action_debt' | 'enter_amount_expense' | 'enter_amount_debt' | 'settings' | 'manage_budgets' | 'settle_specific_debt' | 'confirm_reset' | null;
}
