import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

interface Props {
  title: string;
  amount: number;
  currency?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  style?: ViewStyle;
}

const SummaryCard: React.FC<Props> = ({
  title,
  amount,
  currency = 'USD',
  icon,
  iconColor,
  iconBg,
  style,
}) => (
  <View style={[styles.card, style]}>
    <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={[styles.amount, { color: iconColor }]}>
      {currency} {amount.toFixed(2)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  amount: { fontSize: 16, fontWeight: '700' },
});

export default SummaryCard;
