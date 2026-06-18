import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Transaction, MainTabParamList } from '../../types';
import { getExpensesApi } from '../../api/expenseApi';
import { useAuthStore } from '../../store/authStore';
import COLORS from '../../constants/colors';
import SummaryCard from '../../components/SummaryCard';
import TransactionItem from '../../components/TransactionItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const DashboardScreen: React.FC = () => {
  const userId = useAuthStore((s) => s.userId) ?? '';
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const { data: transactions = [], isLoading, refetch, isRefetching } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: () => getExpensesApi(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  // ── Derived stats ─────────────────────────────────────────────────
  const { totalIncome, totalExpense, balance, recent } = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalIncome = thisMonth
      .filter((t) => t.transactionType === 'INCOME')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = thisMonth
      .filter((t) => t.transactionType === 'EXPENSE')
      .reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    return { totalIncome, totalExpense, balance, recent };
  }, [transactions]);

  const currency = transactions[0]?.currency ?? 'USD';

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Dashboard</Text>
          <Text style={styles.period}>{monthLabel}</Text>
        </View>
        <TouchableOpacity
          style={styles.analyticsBtn}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Ionicons name="bar-chart-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Balance hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Net Balance</Text>
        <Text style={[styles.heroAmount, { color: balance >= 0 ? COLORS.income : COLORS.expense }]}>
          {currency} {balance.toFixed(2)}
        </Text>
        <Text style={styles.heroSub}>This month</Text>
      </View>

      {/* Summary cards */}
      <View style={styles.cardsRow}>
        <SummaryCard
          title="Income"
          amount={totalIncome}
          currency={currency}
          icon="arrow-up-circle"
          iconColor={COLORS.income}
          iconBg={COLORS.incomeLight}
          style={styles.halfCard}
        />
        <SummaryCard
          title="Expenses"
          amount={totalExpense}
          currency={currency}
          icon="arrow-down-circle"
          iconColor={COLORS.expense}
          iconBg={COLORS.expenseLight}
          style={styles.halfCard}
        />
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('Expenses')}
          >
            <View style={[styles.quickIcon, { backgroundColor: COLORS.expenseLight }]}>
              <Ionicons name="remove-circle-outline" size={22} color={COLORS.expense} />
            </View>
            <Text style={styles.quickLabel}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('Income')}
          >
            <View style={[styles.quickIcon, { backgroundColor: COLORS.incomeLight }]}>
              <Ionicons name="add-circle-outline" size={22} color={COLORS.income} />
            </View>
            <Text style={styles.quickLabel}>Add Income</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('Analytics')}
          >
            <View style={[styles.quickIcon, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="pie-chart-outline" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.quickLabel}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {recent.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No transactions yet"
            subtitle="Add your first expense or income"
          />
        ) : (
          recent.map((t) => (
            <TransactionItem
              key={t.externalId}
              transaction={t}
              onEdit={() => navigation.navigate('Expenses')}
              onDelete={() => refetch()}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 24 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
    backgroundColor: COLORS.card,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  period: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  analyticsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  hero: {
    backgroundColor: COLORS.primary,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 4,
  },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  heroAmount: { fontSize: 36, fontWeight: '800', color: COLORS.white },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },

  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.primary,
    paddingTop: 0,
    paddingBottom: 20,
  },
  halfCard: { flex: 1 },

  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  quickRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  quickBtn: { flex: 1, alignItems: 'center', gap: 8 },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500', textAlign: 'center' },
});

export default DashboardScreen;
