import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IncomeStackParamList, Transaction } from '../../types';
import { addExpenseApi, updateExpenseApi } from '../../api/expenseApi';
import { useAuthStore } from '../../store/authStore';
import { useLocalStore } from '../../store/localStore';
import { CURRENCIES } from '../../constants/categories';
import COLORS from '../../constants/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

type Props = {
  navigation: NativeStackNavigationProp<IncomeStackParamList, 'AddEditIncome'>;
  route: RouteProp<IncomeStackParamList, 'AddEditIncome'>;
};

interface FormState {
  merchant: string;
  amount: string;
  currency: string;
  category: string;
  date: string;
}

const AddEditIncomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const existing = route.params?.transaction;
  const isEdit = !!existing;
  const userId = useAuthStore((s) => s.userId) ?? '';
  const queryClient = useQueryClient();
  const incomeCategories = useLocalStore((s) => s.categories).filter(
    (c) => c.type === 'income' || c.type === 'both',
  );

  const [form, setForm] = useState<FormState>({
    merchant: existing?.merchant ?? '',
    amount: existing?.amount?.toString() ?? '',
    currency: existing?.currency ?? 'USD',
    category: existing?.category ?? (incomeCategories[0]?.name ?? ''),
    date: existing?.date ?? new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const set = (field: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.merchant.trim()) e.merchant = 'Source / description is required';
    if (!form.amount.trim()) e.amount = 'Amount is required';
    else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Enter a valid positive amount';
    if (!form.category) e.category = 'Select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
    navigation.goBack();
  };
  const onError = (error: Error) => Alert.alert('Error', error.message);

  const addMutation = useMutation({ mutationFn: addExpenseApi, onSuccess, onError });
  const updateMutation = useMutation({ mutationFn: updateExpenseApi, onSuccess, onError });

  const handleSubmit = () => {
    if (!validate()) return;
    const payload: Omit<Transaction, 'externalId'> = {
      userId,
      merchant: form.merchant.trim(),
      amount: parseFloat(form.amount),
      currency: form.currency,
      category: form.category,
      date: form.date,
      transactionType: 'INCOME',
    };
    if (isEdit && existing) {
      updateMutation.mutate({ externalId: existing.externalId, ...payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const isLoading = addMutation.isPending || updateMutation.isPending;
  const selectedCategory = incomeCategories.find((c) => c.name === form.category);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Input
        label="Source / Description"
        placeholder="e.g. Salary, Freelance, Gift..."
        value={form.merchant}
        onChangeText={set('merchant')}
        leftIcon="briefcase-outline"
        error={errors.merchant}
      />

      <Input
        label="Amount"
        placeholder="0.00"
        value={form.amount}
        onChangeText={set('amount')}
        keyboardType="decimal-pad"
        leftIcon="cash-outline"
        error={errors.amount}
      />

      {/* Currency picker */}
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Currency</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCurrencyPicker(true)}>
          <Text style={styles.pickerValue}>{form.currency}</Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Category picker */}
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCategoryPicker(true)}>
          <View style={styles.categorySelected}>
            {selectedCategory && (
              <View style={[styles.catIconWrap, { backgroundColor: selectedCategory.color + '20' }]}>
                <Ionicons
                  name={selectedCategory.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={selectedCategory.color}
                />
              </View>
            )}
            <Text style={styles.pickerValue}>{form.category || 'Select category'}</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
        {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
      </View>

      <Input
        label="Date (YYYY-MM-DD)"
        placeholder={new Date().toISOString().split('T')[0]}
        value={form.date}
        onChangeText={set('date')}
        leftIcon="calendar-outline"
      />

      <Button
        title={isEdit ? 'Update Income' : 'Add Income'}
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.btn}
      />
      {isEdit && (
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" style={styles.cancelBtn} />
      )}

      {/* Currency modal */}
      <PickerModal
        visible={showCurrencyPicker}
        title="Select Currency"
        items={CURRENCIES.map((c) => ({ id: c, name: c, icon: 'cash-outline', color: COLORS.income }))}
        selected={form.currency}
        onSelect={(v) => { set('currency')(v); setShowCurrencyPicker(false); }}
        onClose={() => setShowCurrencyPicker(false)}
      />

      {/* Category modal */}
      <PickerModal
        visible={showCategoryPicker}
        title="Select Category"
        items={incomeCategories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color }))}
        selected={form.category}
        onSelect={(v) => { set('category')(v); setShowCategoryPicker(false); }}
        onClose={() => setShowCategoryPicker(false)}
      />
    </ScrollView>
  );
};

// ── Picker modal (identical to AddEditExpense version) ────────────────
interface PickerItem { id: string; name: string; icon: string; color: string; }
interface PickerModalProps {
  visible: boolean; title: string; items: PickerItem[];
  selected: string; onSelect: (value: string) => void; onClose: () => void;
}
const PickerModal: React.FC<PickerModalProps> = ({ visible, title, items, selected, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={pickerStyles.backdrop} activeOpacity={1} onPress={onClose} />
    <View style={pickerStyles.sheet}>
      <View style={pickerStyles.handle} />
      <Text style={pickerStyles.title}>{title}</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[pickerStyles.item, item.name === selected && pickerStyles.itemSelected]}
            onPress={() => onSelect(item.name)}
          >
            <View style={[pickerStyles.icon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={item.color} />
            </View>
            <Text style={pickerStyles.itemText}>{item.name}</Text>
            {item.name === selected && <Ionicons name="checkmark" size={18} color={COLORS.income} />}
          </TouchableOpacity>
        )}
      />
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 60 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 13, borderWidth: 1, borderColor: COLORS.border,
  },
  categorySelected: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIconWrap: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  pickerValue: { fontSize: 15, color: COLORS.text, flex: 1 },
  errorText: { fontSize: 12, color: COLORS.expense, marginTop: 4 },
  btn: { marginTop: 8 },
  cancelBtn: { marginTop: 8 },
});

const pickerStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 24 },
  handle: { width: 36, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, paddingHorizontal: 20, paddingVertical: 12 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  itemSelected: { backgroundColor: COLORS.incomeLight },
  icon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemText: { flex: 1, fontSize: 15, color: COLORS.text },
});

export default AddEditIncomeScreen;
