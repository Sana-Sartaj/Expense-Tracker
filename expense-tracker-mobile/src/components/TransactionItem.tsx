import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import { Transaction } from '../types';
import { useLocalStore } from '../store/localStore';

interface Props {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (externalId: string) => void;
}

const TransactionItem: React.FC<Props> = ({ transaction, onEdit, onDelete }) => {
  const categories = useLocalStore((s) => s.categories);
  const isIncome = transaction.transactionType === 'INCOME';

  // Find matching category for icon + color
  const cat = categories.find(
    (c) => c.name.toLowerCase() === transaction.category.toLowerCase(),
  );
  const iconName = (cat?.icon ?? 'cash-outline') as keyof typeof Ionicons.glyphMap;
  const iconColor = cat?.color ?? COLORS.primary;

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      `Delete "${transaction.merchant}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(transaction.externalId),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Category icon */}
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>

      {/* Merchant + category + date */}
      <View style={styles.info}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchant}
        </Text>
        <Text style={styles.meta}>
          {transaction.category} · {formatDate(transaction.date)}
        </Text>
      </View>

      {/* Amount */}
      <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
        {isIncome ? '+' : '-'}{transaction.currency}{' '}
        {Math.abs(transaction.amount).toFixed(2)}
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(transaction)} style={styles.actionBtn}>
          <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={16} color={COLORS.expense} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: { flex: 1, gap: 2 },
  merchant: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textSecondary },
  amount: { fontSize: 14, fontWeight: '700', marginHorizontal: 8 },
  income: { color: COLORS.income },
  expense: { color: COLORS.expense },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
});

export default TransactionItem;
