import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Transaction } from '../../types';
import { getExpensesApi } from '../../api/expenseApi';
import { useAuthStore } from '../../store/authStore';
import { useLocalStore } from '../../store/localStore';
import COLORS from '../../constants/colors';
import ProgressBar from '../../components/ProgressBar';
import Button from '../../components/Button';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const BudgetScreen: React.FC = () => {
  const userId = useAuthStore((s) => s.userId) ?? '';
  const { categories, budgets, addBudget, updateBudget, deleteBudget, getBudget } = useLocalStore();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBudgetId, setEditBudgetId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [limitError, setLimitError] = useState('');

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: () => getExpensesApi(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  // ── Compute spend per category for selected month ─────────────────
  const categorySpend = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          t.transactionType === 'EXPENSE' &&
          d.getFullYear() === year &&
          d.getMonth() + 1 === month
        );
      })
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + t.amount;
        return acc;
      }, {});
  }, [transactions, selectedMonth]);

  // Budgets for selected month
  const monthBudgets = budgets.filter((b) => b.month === selectedMonth);
  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  // ── Month navigation ──────────────────────────────────────────────
  const navigateMonth = (dir: -1 | 1) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 1 + dir, 1);
    setSelectedMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    );
  };

  const monthDisplay = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return `${MONTHS[m - 1]} ${y}`;
  };

  // ── Add/Edit handlers ─────────────────────────────────────────────
  const openAdd = () => {
    setEditBudgetId(null);
    setSelectedCategory(expenseCategories[0]?.name ?? '');
    setLimitInput('');
    setLimitError('');
    setShowAddModal(true);
  };

  const openEdit = (id: string, category: string, limit: number) => {
    setEditBudgetId(id);
    setSelectedCategory(category);
    setLimitInput(limit.toString());
    setLimitError('');
    setShowAddModal(true);
  };

  const handleSave = () => {
    const limit = parseFloat(limitInput);
    if (isNaN(limit) || limit <= 0) { setLimitError('Enter a valid positive amount'); return; }
    setLimitError('');
    if (editBudgetId) {
      updateBudget(editBudgetId, { category: selectedCategory, limit, month: selectedMonth });
    } else {
      addBudget({ category: selectedCategory, limit, month: selectedMonth });
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Budget', `Remove budget for "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBudget(id) },
    ]);
  };

  // ── Summary stats ─────────────────────────────────────────────────
  const totalBudgeted = monthBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (categorySpend[b.category] ?? 0), 0);

  return (
    <View style={styles.screen}>
      {/* Month selector */}
      <View style={styles.monthBar}>
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthDisplay()}</Text>
        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Budgeted</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.primary }]}>
            ${totalBudgeted.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Spent</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.expense }]}>
            ${totalSpent.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Remaining</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.income }]}>
            ${Math.max(0, totalBudgeted - totalSpent).toFixed(2)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {monthBudgets.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No budgets set</Text>
            <Text style={styles.emptySubtitle}>Set spending limits to track your expenses</Text>
          </View>
        ) : (
          monthBudgets.map((budget) => {
            const spent = categorySpend[budget.category] ?? 0;
            const percent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            const cat = categories.find((c) => c.name === budget.category);

            return (
              <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetLeft}>
                    <View style={[styles.catIcon, { backgroundColor: (cat?.color ?? COLORS.primary) + '20' }]}>
                      <Ionicons
                        name={(cat?.icon ?? 'wallet-outline') as keyof typeof Ionicons.glyphMap}
                        size={18}
                        color={cat?.color ?? COLORS.primary}
                      />
                    </View>
                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                  </View>
                  <View style={styles.budgetActions}>
                    <TouchableOpacity
                      onPress={() => openEdit(budget.id, budget.category, budget.limit)}
                      style={styles.actionBtn}
                    >
                      <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(budget.id, budget.category)}
                      style={styles.actionBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.expense} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.budgetAmounts}>
                  <Text style={styles.spentText}>${spent.toFixed(2)} spent</Text>
                  <Text style={styles.limitText}>of ${budget.limit.toFixed(2)}</Text>
                </View>

                <ProgressBar percent={percent} style={styles.progress} />

                {percent >= 100 && (
                  <View style={styles.overBudget}>
                    <Ionicons name="warning-outline" size={14} color={COLORS.expense} />
                    <Text style={styles.overBudgetText}>Over budget by ${(spent - budget.limit).toFixed(2)}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Add/Edit Budget Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <TouchableOpacity style={modalStyles.backdrop} activeOpacity={1} onPress={() => setShowAddModal(false)} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>{editBudgetId ? 'Edit Budget' : 'Set Budget'}</Text>

          {/* Category selector */}
          <Text style={modalStyles.label}>Category</Text>
          <TouchableOpacity style={modalStyles.pickerBtn} onPress={() => setShowCategoryPicker(true)}>
            <Text style={modalStyles.pickerValue}>{selectedCategory || 'Select category'}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Limit input */}
          <Text style={[modalStyles.label, { marginTop: 16 }]}>Monthly Limit ($)</Text>
          <TextInput
            style={[modalStyles.textInput, limitError ? modalStyles.inputError : null]}
            placeholder="0.00"
            placeholderTextColor={COLORS.textSecondary}
            value={limitInput}
            onChangeText={setLimitInput}
            keyboardType="decimal-pad"
          />
          {limitError ? <Text style={modalStyles.errorText}>{limitError}</Text> : null}

          <View style={modalStyles.actions}>
            <Button title="Cancel" variant="ghost" onPress={() => setShowAddModal(false)} style={{ flex: 1 }} />
            <Button title={editBudgetId ? 'Update' : 'Set Budget'} onPress={handleSave} style={{ flex: 1 }} />
          </View>
        </View>

        {/* Category picker inside modal */}
        {showCategoryPicker && (
          <View style={pickerStyles.overlay}>
            <View style={pickerStyles.sheet}>
              <Text style={pickerStyles.title}>Select Category</Text>
              <FlatList
                data={expenseCategories}
                keyExtractor={(c) => c.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[pickerStyles.item, item.name === selectedCategory && pickerStyles.itemSelected]}
                    onPress={() => { setSelectedCategory(item.name); setShowCategoryPicker(false); }}
                  >
                    <View style={[pickerStyles.icon, { backgroundColor: item.color + '20' }]}>
                      <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={item.color} />
                    </View>
                    <Text style={pickerStyles.itemText}>{item.name}</Text>
                    {item.name === selectedCategory && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  monthBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  navBtn: { padding: 8 },
  monthText: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  summaryRow: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    paddingVertical: 16, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryDivider: { width: 1, backgroundColor: COLORS.border },
  summaryLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  summaryAmount: { fontSize: 16, fontWeight: '700' },

  content: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },

  budgetCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  budgetCategory: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  budgetActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 6 },

  budgetAmounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  spentText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  limitText: { fontSize: 13, color: COLORS.textSecondary },

  progress: { marginBottom: 6 },
  overBudget: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  overBudgetText: { fontSize: 12, color: COLORS.expense, fontWeight: '500' },

  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32,
  },
  handle: { width: 36, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.background, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 11, borderWidth: 1, borderColor: COLORS.border,
  },
  pickerValue: { fontSize: 15, color: COLORS.text },
  textInput: {
    backgroundColor: COLORS.background, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 11, fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  inputError: { borderColor: COLORS.expense },
  errorText: { fontSize: 12, color: COLORS.expense, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
});

const pickerStyles = StyleSheet.create({
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: 300, paddingBottom: 20,
  },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, padding: 16, paddingBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  itemSelected: { backgroundColor: COLORS.primaryLight },
  icon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  itemText: { flex: 1, fontSize: 15, color: COLORS.text },
});

export default BudgetScreen;
