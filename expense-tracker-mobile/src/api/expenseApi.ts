import apiClient from './client';
import { Transaction, TransactionRequest } from '../types';

// ── POST /expense/v1/add ─────────────────────────────────────────
export const addTransactionApi = async (
  data: TransactionRequest,
): Promise<Transaction> => {
  const res = await apiClient.post<Transaction>('/expense/v1/add', data);
  return res.data;
};

// ── GET /expense/v1/{userId} ─────────────────────────────────────
export const getTransactionsApi = async (
  userId: string,
): Promise<Transaction[]> => {
  const res = await apiClient.get<Transaction[]>(`/expense/v1/${userId}`);
  // Normalise: ensure transactionType exists (backend may omit it)
  return (res.data ?? []).map(normalise);
};

// ── GET /expense/v1/{userId}/{start}/{end} ───────────────────────
export const getTransactionsByRangeApi = async (
  userId: string,
  start: string,  // "YYYY-MM-DD"
  end: string,    // "YYYY-MM-DD"
): Promise<Transaction[]> => {
  const res = await apiClient.get<Transaction[]>(
    `/expense/v1/${userId}/${start}/${end}`,
  );
  return (res.data ?? []).map(normalise);
};

// ── PUT /expense/v1/update ───────────────────────────────────────
export const updateTransactionApi = async (
  data: TransactionRequest,
): Promise<Transaction> => {
  const res = await apiClient.put<Transaction>('/expense/v1/update', data);
  return res.data;
};

// ── DELETE /expense/v1/{userId}/{externalId} ─────────────────────
export const deleteTransactionApi = async (
  userId: string,
  externalId: string,
): Promise<void> => {
  await apiClient.delete(`/expense/v1/${userId}/${externalId}`);
};

// ── Helpers ──────────────────────────────────────────────────────

/**
 * If the backend does not return `transactionType`, infer it from
 * the category name so income items still display correctly.
 */
const INCOME_CATEGORIES = [
  'salary', 'freelance', 'investment', 'gift',
  'other income', 'income',
];

function normalise(t: Transaction): Transaction {
  if (t.transactionType) return t;
  const lc = (t.category ?? '').toLowerCase();
  const type = INCOME_CATEGORIES.some((c) => lc.includes(c))
    ? 'INCOME'
    : 'EXPENSE';
  return { ...t, transactionType: type };
}
