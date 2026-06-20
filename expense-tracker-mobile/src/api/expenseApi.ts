import apiClient from './client';
import { Transaction, TransactionRequest, TransactionType } from '../types';

// Snake_case shape returned by the backend
interface BackendExpense {
  external_id: string;
  amount: number;
  user_id: string;
  merchant: string;
  currency: string;
  created_at?: string;
  category?: string;
  transaction_type?: string;
}

interface PagedExpenseResponse {
  items: BackendExpense[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

function toTransaction(e: BackendExpense): Transaction {
  return {
    externalId: e.external_id,
    userId: e.user_id,
    merchant: e.merchant,
    amount: Number(e.amount),
    currency: e.currency,
    category: e.category ?? '',
    date: e.created_at ? e.created_at.split('T')[0] : '',
    transactionType: (e.transaction_type as TransactionType) ?? 'EXPENSE',
  };
}

// ── POST /expense/v1/addExpense ──────────────────────────────────
export const addExpenseApi = async (data: TransactionRequest): Promise<boolean> => {
  const res = await apiClient.post<boolean>(
    '/expense/v1/addExpense',
    {
      amount: data.amount,
      merchant: data.merchant,
      currency: data.currency,
      category: data.category,
      transaction_type: data.transactionType,
    },
    { headers: { 'X-User-Id': data.userId } },
  );
  return res.data;
};

// ── PUT /expense/v1/updateExpense ────────────────────────────────
export const updateExpenseApi = async (data: TransactionRequest): Promise<boolean> => {
  const res = await apiClient.put<boolean>(
    '/expense/v1/updateExpense',
    {
      external_id: data.externalId,
      amount: data.amount,
      merchant: data.merchant,
      currency: data.currency,
      category: data.category,
      transaction_type: data.transactionType,
    },
    { headers: { 'X-User-Id': data.userId } },
  );
  return res.data;
};

// ── GET /expense/v1/getExpense ───────────────────────────────────
export const getTransactionsApi = async (userId: string): Promise<Transaction[]> => {
  const res = await apiClient.get<PagedExpenseResponse>(
    '/expense/v1/getExpense',
    { headers: { 'X-User-Id': userId } },
  );
  return (res.data?.items ?? []).map(toTransaction);
};

// alias used by multiple screens
export const getExpensesApi = getTransactionsApi;

// ── GET /expense/v1/getExpenseByDateRange ────────────────────────
export const getTransactionsByRangeApi = async (
  userId: string,
  startDate: number,
  endDate: number,
): Promise<Transaction[]> => {
  const res = await apiClient.get<BackendExpense[]>(
    '/expense/v1/getExpenseByDateRange',
    {
      headers: { 'X-User-Id': userId },
      params: { startDate, endDate },
    },
  );
  return (res.data ?? []).map(toTransaction);
};

// ── DELETE /expense/v1/deleteExpense ─────────────────────────────
export const deleteTransactionApi = async (
  userId: string,
  externalId: string,
): Promise<void> => {
  await apiClient.delete('/expense/v1/deleteExpense', {
    headers: { 'X-User-Id': userId },
    params: { externalId },
  });
};
