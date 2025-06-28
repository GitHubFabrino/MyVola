export interface Transaction {
    id?: number;
    title: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    category?: string;
    notes?: string;
}

export interface TransactionFilters {
    startDate?: string;
    endDate?: string;
    type?: 'income' | 'expense' | 'all';
    category?: string;
}

export interface TransactionsState {
    items: Transaction[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    filters: TransactionFilters;
}