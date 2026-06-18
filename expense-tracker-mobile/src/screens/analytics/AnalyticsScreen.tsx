import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { PieChart, BarChart } from 'react-native-chart-kit';

import { Transaction } from '../../types';
import { getExpensesApi } from '../../api/expenseApi';
import { useAuthStore } from '../../store/authStore';
import { useLocalStore } from '../../store/localStore';
import COLORS from '../../constants/colors';
import LoadingSpinner from '../../components/LoadingSpinner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const AnalyticsScreen: React.FC = () => {
  const userId = useAuthStore((s) => s.userId) ?? '';
  const categories = useLocalStore((s) => s.categories);
  const [view, setView] = useState<'expense' | 'income'>('expense');

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: () => getExpensesApi(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  // ── Last 6 months bar chart data ──────────────────────────────────
  const barData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: monthKey(d), label: MONTHS[d.getMonth()] });
    }
    const totals = months.map(({ key }) =>
      transactions
        .filter((t) => t.transactionType === (view === 'expense' ? 'EXPENSE' : 'INCOME'))
        .filter((t) => monthKey(new Date(t.date)) === key)
        .reduce((s, t) => s + t.amount, 0),
    );
    return {
      labels: months.map((m) => m.label),
      datasets: [{ data: totals.map((v) => Math.max(v, 0.01)) }],
    };
  }, [transactions, view]);

  // ── Current month pie chart by category ──────────────────────────
  const pieData = useMemo(() => {
    const now = new Date();
    const key = monthKey(now);
    const byCategory: Record<string, number> = {};
    transactions
      .filter(
        (t) =>
          t.transactionType === (view === 'expense' ? 'EXPENSE' : 'INCOME') &&
          monthKey(new Date(t.date)) === key,
      )
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
      });

    return Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([cat, amount], i) => {
        const catDef = categories.find((c) => c.name === cat);
        return {
          name: cat,
          amount,
          color: catDef?.color ?? COLORS.chart[i % COLORS.chart.length],
          legendFontColor: COLORS.text,
          legendFontSize: 12,
        };
      });
  }, [transactions, view, categories]);

  // ── Summary for current month ─────────────────────────────────────
  const { totalExpense, totalIncome } = useMemo(() => {
    const now = new Date();
    const key = monthKey(now);
    const thisMonth = transactions.filter((t) => monthKey(new Date(t.date)) === key);
    return {
      totalExpense: thisMonth.filter((t) => t.transactionType === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
      totalIncome: thisMonth.filter((t) => t.transactionType === 'INCOME').reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions]);

  const currency = transactions[0]?.currency ?? 'USD';

  if (isLoading) return <LoadingSpinner message="Loading analytics..." />;

  const chartConfig = {
    backgroundGradientFrom: COLORS.card,
    backgroundGradientTo: COLORS.card,
    color: () => (view === 'expense' ? COLORS.expense : COLORS.income),
    labelColor: () => COLORS.textSecondary,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 0,
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Analytics</Text>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'expense' && styles.toggleActive]}
          onPress={() => setView('expense')}
        >
          <Text style={[styles.toggleText, view === 'expense' && styles.toggleTextActive]}>
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'income' && styles.toggleActiveIncome]}
          onPress={() => setView('income')}
        >
          <Text style={[styles.toggleText, view === 'income' && styles.toggleTextActive]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* This month summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: COLORS.expense }]}>
          <Text style={styles.summaryLabel}>This Month Expenses</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.expense }]}>
            {currency} {totalExpense.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: COLORS.income }]}>
          <Text style={styles.summaryLabel}>This Month Income</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.income }]}>
            {currency} {totalIncome.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Bar chart — 6-month trend */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {view === 'expense' ? 'Expense' : 'Income'} Trend (6 months)
        </Text>
        {barData.datasets[0].data.every((v) => v <= 0.01) ? (
          <View style={styles.noData}>
            <Ionicons name="bar-chart-outline" size={32} color={COLORS.textSecondary} />
            <Text style={styles.noDataText}>No data yet</Text>
          </View>
        ) : (
          <BarChart
            data={barData}
            width={CHART_WIDTH - 32}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
          />
        )}
      </View>

      {/* Pie chart — category breakdown */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {view === 'expense' ? 'Expense' : 'Income'} by Category (this month)
        </Text>
        {pieData.length === 0 ? (
          <View style={styles.noData}>
            <Ionicons name="pie-chart-outline" size={32} color={COLORS.textSecondary} />
            <Text style={styles.noDataText}>No data for this month</Text>
          </View>
        ) : (
          <>
            <PieChart
              data={pieData}
              width={CHART_WIDTH - 32}
              height={180}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="8"
              hasLegend={false}
            />
            {/* Legend */}
            <View style={styles.legend}>
              {pieData.map((d) => (
                <View key={d.name} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                  <Text style={styles.legendLabel} numberOfLines={1}>{d.name}</Text>
                  <Text style={styles.legendAmount}>{currency} {d.amount.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Net balance summary */}
      <View style={styles.netCard}>
        <Text style={styles.netLabel}>Net Balance This Month</Text>
        <Text style={[
          styles.netAmount,
          { color: totalIncome - totalExpense >= 0 ? COLORS.income : COLORS.expense },
        ]}>
          {totalIncome - totalExpense >= 0 ? '+' : ''}{currency} {(totalIncome - totalExpense).toFixed(2)}
        </Text>
        <Text style={styles.netSub}>Income − Expenses</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },

  pageTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 16, marginTop: 8 },

  toggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  toggleActive: { backgroundColor: COLORS.expense },
  toggleActiveIncome: { backgroundColor: COLORS.income },
  toggleText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  toggleTextActive: { color: COLORS.white },

  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  summaryLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  summaryAmount: { fontSize: 16, fontWeight: '700' },

  chartCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  chartTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  chart: { borderRadius: 8, marginLeft: -16 },
  noData: { height: 120, justifyContent: 'center', alignItems: 'center', gap: 8 },
  noDataText: { fontSize: 14, color: COLORS.textSecondary },

  legend: { marginTop: 12, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { flex: 1, fontSize: 13, color: COLORS.text },
  legendAmount: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },

  netCard: {
    backgroundColor: COLORS.primary, borderRadius: 16, padding: 20,
    alignItems: 'center', gap: 4,
  },
  netLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  netAmount: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  netSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
});

export default AnalyticsScreen;
