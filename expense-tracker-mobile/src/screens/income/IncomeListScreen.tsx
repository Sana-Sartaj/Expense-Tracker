import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Transaction, IncomeStackParamList } from '../../types';
import { getExpensesApi, deleteTransactionApi } from '../../api/expenseApi';
import { useAuthStore } from '../../store/authStore';
import COLORS from '../../constants/colors';
import TransactionItem from '../../components/TransactionItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

type Props = {
  navigation: NativeStackNavigationProp<IncomeStackParamList, 'IncomeList'>;
};

const IncomeListScreen: React.FC<Props> = ({ navigation }) => {
  const userId = useAuthStore((s) => s.userId) ?? '';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: all = [], isLoading, refetch, isRefetching } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: () => getExpensesApi(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  // Filter to INCOME type only
  const income = useMemo(() => {
    const filtered = all.filter((t) => t.transactionType === 'INCOME');
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (t) =>
        t.merchant.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [all, search]);

  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const currency = income[0]?.currency ?? 'USD';

  const deleteMutation = useMutation({
    mutationFn: (externalId: string) => deleteTransactionApi(userId, externalId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions', userId] }),
    onError: () => Alert.alert('Error', 'Could not delete the transaction. Please try again.'),
  });

  const handleDelete = (externalId: string) => deleteMutation.mutate(externalId);

  if (isLoading) return <LoadingSpinner message="Loading income..." />;

  return (
    <View style={styles.screen}>
      {/* Summary bar */}
      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryAmount}>
            {currency} {totalIncome.toFixed(2)}
          </Text>
        </View>
        <Text style={styles.count}>{income.length} records</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search income..."
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={income}
        keyExtractor={(t) => t.externalId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.income]}
            tintColor={COLORS.income}
          />
        }
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onEdit={() => navigation.navigate('AddEditIncome', { transaction: item })}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="trending-up-outline"
            title="No income recorded"
            subtitle={search ? 'Try a different search' : 'Tap + to add income'}
            actionLabel={search ? undefined : 'Add Income'}
            onAction={
              search
                ? undefined
                : () => navigation.navigate('AddEditIncome', { transaction: undefined })
            }
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditIncome', { transaction: undefined })}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },

  summary: {
    backgroundColor: COLORS.income,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  summaryAmount: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginTop: 2 },
  count: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    margin: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },

  list: { paddingHorizontal: 12, paddingBottom: 100 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.income,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.income,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default IncomeListScreen;
