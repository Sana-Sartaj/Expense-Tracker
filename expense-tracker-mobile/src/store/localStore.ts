import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';

// ── Helpers ───────────────────────────────────────────────────────
const uuid = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// ── Category slice ────────────────────────────────────────────────
interface CategorySlice {
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
}

// ── Budget slice ──────────────────────────────────────────────────
interface BudgetSlice {
  budgets: Budget[];
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Omit<Budget, 'id'>>) => void;
  deleteBudget: (id: string) => void;
  /** Returns the budget for a specific category + month, or undefined */
  getBudget: (category: string, month: string) => Budget | undefined;
}

type LocalState = CategorySlice & BudgetSlice;

export const useLocalStore = create<LocalState>()(
  persist(
    (set, get) => ({
      // ── categories ─────────────────────────────────────────────
      categories: DEFAULT_CATEGORIES,

      addCategory: (cat) =>
        set((s) => ({
          categories: [...s.categories, { ...cat, id: uuid() }],
        })),

      updateCategory: (id, updates) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      // ── budgets ─────────────────────────────────────────────────
      budgets: [],

      addBudget: (b) =>
        set((s) => ({ budgets: [...s.budgets, { ...b, id: uuid() }] })),

      updateBudget: (id, updates) =>
        set((s) => ({
          budgets: s.budgets.map((b) =>
            b.id === id ? { ...b, ...updates } : b,
          ),
        })),

      deleteBudget: (id) =>
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      getBudget: (category, month) =>
        get().budgets.find(
          (b) => b.category === category && b.month === month,
        ),
    }),
    {
      name: 'local-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
