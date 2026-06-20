import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';

import { MoreStackParamList } from '../../types';
import { analyzeSmsApi, SmsExtractResult } from '../../api/dsApi';
import { useAuthStore } from '../../store/authStore';
import COLORS from '../../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'SmartAdd'>;
};

const EXAMPLE_SMS =
  'You spent Rs. 850 at Zomato using your HDFC bank card on 20-Jun-2026';

const SmartAddScreen: React.FC<Props> = ({ navigation }) => {
  const userId = useAuthStore((s) => s.userId) ?? '';
  const queryClient = useQueryClient();

  const [smsText, setSmsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmsExtractResult | null>(null);

  const handleExtract = async () => {
    const text = smsText.trim();
    if (!text) {
      Alert.alert('Paste your SMS', 'Copy a bank SMS and paste it in the box above.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const data = await analyzeSmsApi(text);
      setResult(data);
      // Invalidate so the expense list refreshes when user navigates back
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
    } catch (err: any) {
      const msg: string = err?.message ?? 'Something went wrong.';
      if (msg.includes('Invalid message format')) {
        Alert.alert(
          'Not a bank SMS',
          'The text does not look like a bank SMS.\n\nMake sure it mentions: spent, bank, or card.',
        );
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    setSmsText('');
    setResult(null);
    navigation.goBack();
  };

  const handleAddAnother = () => {
    setSmsText('');
    setResult(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* How it works */}
        <View style={styles.infoCard}>
          <Ionicons name="sparkles" size={22} color={COLORS.primary} />
          <Text style={styles.infoTitle}>AI-Powered Expense Import</Text>
          <Text style={styles.infoBody}>
            Copy a transaction SMS from your bank app and paste it below. Mistral AI
            will extract the amount, merchant, and currency and add it to your expenses
            automatically.
          </Text>
        </View>

        {/* SMS input */}
        <Text style={styles.label}>Paste Bank SMS</Text>
        <TextInput
          style={styles.smsInput}
          value={smsText}
          onChangeText={setSmsText}
          placeholder={EXAMPLE_SMS}
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          editable={!isLoading && !result}
        />

        {/* Extract button */}
        {!result && (
          <TouchableOpacity
            style={[styles.extractBtn, (isLoading || !smsText.trim()) && styles.btnDisabled]}
            onPress={handleExtract}
            disabled={isLoading || !smsText.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="flash-outline" size={18} color={COLORS.white} />
                <Text style={styles.extractBtnText}>Extract with AI</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Result card */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.successDot} />
              <Text style={styles.resultTitle}>Expense Extracted & Saved</Text>
            </View>

            <View style={styles.resultRow}>
              <Ionicons name="storefront-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.resultLabel}>Merchant</Text>
              <Text style={styles.resultValue}>{result.merchant ?? '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.resultRow}>
              <Ionicons name="cash-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.resultLabel}>Amount</Text>
              <Text style={[styles.resultValue, styles.amountText]}>
                {result.currency} {result.amount}
              </Text>
            </View>

            <Text style={styles.resultNote}>
              The expense has been sent to your account via Kafka. Pull-to-refresh on
              the Expenses screen to see it.
            </Text>

            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.anotherBtn} onPress={handleAddAnother}>
                <Text style={styles.anotherBtnText}>Add Another</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Example hint */}
        {!result && !isLoading && (
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>Example SMS formats that work:</Text>
            <Text style={styles.exampleText}>
              • "You spent Rs. 850 at Zomato using your HDFC bank card"{'\n'}
              • "INR 2,500 debited from your bank account at Amazon"{'\n'}
              • "Your card was used for USD 19.99 at Netflix"
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },

  infoCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },
  infoBody: { fontSize: 13, color: COLORS.text, textAlign: 'center', lineHeight: 19 },

  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },

  smsInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  extractBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.5 },
  extractBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },

  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d1fae5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  successDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.income },
  resultTitle: { fontSize: 15, fontWeight: '700', color: COLORS.income },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  resultLabel: { flex: 1, fontSize: 14, color: COLORS.textSecondary },
  resultValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  amountText: { fontSize: 16, fontWeight: '800', color: COLORS.expense },
  divider: { height: 1, backgroundColor: COLORS.border },
  resultNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  resultActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  anotherBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  anotherBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  doneBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  doneBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },

  exampleBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  exampleLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 },
  exampleText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 20 },
});

export default SmartAddScreen;
