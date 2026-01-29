import React from 'react';
import { PiggyBank, HandCoins, Landmark, CreditCard, ShieldCheck } from 'lucide-react';
import { SummaryCard } from './SummaryCard';
import { ExpenseChart } from './ExpenseChart';
import { MainWidget } from '../MainWidget';
import { IncomeInlineDetail } from './IncomeInlineDetail';
import { ExpenseInlineDetail } from './ExpenseInlineDetail';
import { SavingsInlineDetail } from './SavingsInlineDetail';
import { InvestmentInlineDetail } from './InvestmentInlineDetail';
import { LoansInlineDetail } from './LoansInlineDetail';

interface DashboardProps {
    monthName: string;
    income: number;
    expenses: number;
    balance: number;
    distributionData: { name: string; value: number; color: string }[];
    savings: number;
    investments: number;
    receivables: number;
    debts: number;
    creditCardsBalance: number;
    onNavigate: (view: string) => void;
    privacyMode: boolean;
    transactions: any[];
    categories: any[];
    debtItems: any[];
}

export const Dashboard = ({
    monthName,
    income,
    expenses,
    balance,
    distributionData,
    savings,
    investments,
    receivables,
    debts,
    creditCardsBalance,
    onNavigate,
    privacyMode,
    transactions,
    categories,
    debtItems
}: DashboardProps) => {

    const [expandedSection, setExpandedSection] = React.useState<'ingresos' | 'gastos' | 'ahorro' | 'inversion' | 'deudas' | null>(null);

    const toggleSection = (section: 'ingresos' | 'gastos' | 'ahorro' | 'inversion' | 'deudas') => {
        if (expandedSection === section) setExpandedSection(null);
        else setExpandedSection(section);
    };

    const totalActivos = savings + investments + receivables;
    const totalObligaciones = debts + creditCardsBalance;

    return (
        <div className="flex flex-col gap-6 pb-32 animate-fade-in no-scrollbar">

            {/* 1. MONTHLY SUMMARY */}
            <section>

                <SummaryCard
                    income={income}
                    expenses={expenses}
                    balance={balance}
                    onIncomeClick={() => toggleSection('ingresos')}
                    onExpenseClick={() => toggleSection('gastos')}
                />
            </section>

            {/* INCOME / EXPENSE DETAILS */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSection === 'ingresos' || expandedSection === 'gastos' ? 'max-h-[1200px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                {expandedSection === 'ingresos' && (
                    <IncomeInlineDetail
                        transactions={transactions.filter(t => t.tipo === 'ingreso')}
                        totalIncome={income}
                    />
                )}
                {expandedSection === 'gastos' && (
                    <ExpenseInlineDetail
                        transactions={transactions.filter(t => t.tipo === 'gasto')}
                        categories={categories}
                        chartData={distributionData}
                    />
                )}
            </div>

            {/* 2. MAIN SECTIONS: AHORRO, INVERSION, DEUDAS */}
            <section>
                <div className="grid grid-cols-3 gap-2 px-1 mb-4">
                    {/* AHORRO */}
                    <MainWidget
                        title="Ahorro"
                        value={savings}
                        theme="blue"
                        icon={PiggyBank}
                        onClick={() => toggleSection('ahorro')}
                        privacyMode={privacyMode}
                    />

                    {/* INVERSION */}
                    <MainWidget
                        title="Inversión"
                        value={investments}
                        theme="purple"
                        icon={HandCoins}
                        onClick={() => toggleSection('inversion')}
                        privacyMode={privacyMode}
                    />

                    {/* DEUDAS */}
                    <MainWidget
                        title="Préstamos"
                        value={debts + creditCardsBalance}
                        theme="orange"
                        icon={Landmark}
                        onClick={() => toggleSection('deudas')}
                        privacyMode={privacyMode}
                    />
                </div>

                {/* EXPANDED DETAILS AREA - FULL WIDTH */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSection === 'ahorro' || expandedSection === 'inversion' || expandedSection === 'deudas' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {expandedSection === 'ahorro' && (
                        <SavingsInlineDetail
                            transactions={transactions.filter(t => t.tipo === 'ahorro')}
                            total={savings}
                            categories={categories}
                        />
                    )}
                    {expandedSection === 'inversion' && (
                        <InvestmentInlineDetail
                            transactions={transactions.filter(t => t.tipo === 'inversion')}
                            total={investments}
                            categories={categories}
                        />
                    )}
                    {expandedSection === 'deudas' && (
                        <LoansInlineDetail
                            debts={debtItems}
                            creditCardsBalance={creditCardsBalance}
                            onViewCards={() => onNavigate('koin')}
                        />
                    )}
                </div>
            </section>
        </div>
    );
};
