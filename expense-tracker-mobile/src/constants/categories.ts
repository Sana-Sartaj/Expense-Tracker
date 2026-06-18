import { Category } from '../types';
import COLORS from './colors';

export const DEFAULT_CATEGORIES: Category[] = [
  // ── Expense categories ──────────────────────
  { id: 'e1', name: 'Food & Dining',    icon: 'fast-food-outline',       color: COLORS.chart[2], type: 'expense' },
  { id: 'e2', name: 'Transport',        icon: 'car-outline',              color: COLORS.chart[5], type: 'expense' },
  { id: 'e3', name: 'Shopping',         icon: 'bag-outline',              color: COLORS.chart[3], type: 'expense' },
  { id: 'e4', name: 'Bills & Utilities',icon: 'receipt-outline',          color: COLORS.chart[4], type: 'expense' },
  { id: 'e5', name: 'Health',           icon: 'medkit-outline',           color: COLORS.chart[6], type: 'expense' },
  { id: 'e6', name: 'Entertainment',    icon: 'film-outline',             color: COLORS.chart[0], type: 'expense' },
  { id: 'e7', name: 'Education',        icon: 'school-outline',           color: COLORS.chart[7], type: 'expense' },
  { id: 'e8', name: 'Other Expense',    icon: 'ellipsis-horizontal-outline', color: COLORS.textLight, type: 'expense' },

  // ── Income categories ──────────────────────
  { id: 'i1', name: 'Salary',           icon: 'wallet-outline',           color: COLORS.income,   type: 'income' },
  { id: 'i2', name: 'Freelance',        icon: 'briefcase-outline',        color: COLORS.chart[0], type: 'income' },
  { id: 'i3', name: 'Investment',       icon: 'trending-up-outline',      color: COLORS.chart[1], type: 'income' },
  { id: 'i4', name: 'Gift',             icon: 'gift-outline',             color: COLORS.chart[3], type: 'income' },
  { id: 'i5', name: 'Other Income',     icon: 'ellipsis-horizontal-outline', color: COLORS.textLight, type: 'income' },
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];
