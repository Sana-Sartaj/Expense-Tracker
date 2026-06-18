import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../../types';
import { useLocalStore } from '../../store/localStore';
import COLORS from '../../constants/colors';
import Button from '../../components/Button';

const CATEGORY_ICONS = [
  'fast-food-outline', 'car-outline', 'home-outline', 'medical-outline',
  'film-outline', 'shirt-outline', 'book-outline', 'barbell-outline',
  'airplane-outline', 'gift-outline', 'briefcase-outline', 'trending-up-outline',
  'cash-outline', 'card-outline', 'laptop-outline', 'restaurant-outline',
] as const;

const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#A855F7', '#EC4899', '#14B8A6',
  '#6366F1', '#F59E0B', '#10B981', '#0EA5E9',
];

const CategoryScreen: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useLocalStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', icon: CATEGORY_ICONS[0], color: CATEGORY_COLORS[0], type: 'expense' as Category['type'] });
  const [nameError, setNameError] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');
  const incomeCategories = categories.filter((c) => c.type === 'income' || c.type === 'both');

  const handleAdd = () => {
    if (!form.name.trim()) { setNameError('Name is required'); return; }
    setNameError('');
    addCategory({ name: form.name.trim(), icon: form.icon, color: form.color, type: form.type });
    setForm({ name: '', icon: CATEGORY_ICONS[0], color: CATEGORY_COLORS[0], type: 'expense' });
    setShowModal(false);
  };

  const handleDelete = (cat: Category) => {
    Alert.alert(
      'Delete Category',
      `Delete "${cat.name}"? Existing transactions won't be affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(cat.id) },
      ],
    );
  };

  const renderSection = (title: string, data: Category[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.map((cat) => (
        <View key={cat.id} style={styles.item}>
          <View style={[styles.iconWrap, { backgroundColor: cat.color + '20' }]}>
            <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={20} color={cat.color} />
          </View>
          <Text style={styles.itemName}>{cat.name}</Text>
          <TouchableOpacity onPress={() => handleDelete(cat)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={[]}
        renderItem={null}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {renderSection('Expense Categories', expenseCategories)}
            {renderSection('Income Categories', incomeCategories)}
          </>
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Add Category Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={modalStyles.backdrop} activeOpacity={1} onPress={() => setShowModal(false)} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>New Category</Text>

          {/* Name */}
          <Text style={modalStyles.label}>Name</Text>
          <TextInput
            style={[modalStyles.textInput, nameError ? modalStyles.inputError : null]}
            placeholder="Category name"
            placeholderTextColor={COLORS.textSecondary}
            value={form.name}
            onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
          />
          {nameError ? <Text style={modalStyles.errorText}>{nameError}</Text> : null}

          {/* Type */}
          <Text style={[modalStyles.label, { marginTop: 12 }]}>Type</Text>
          <View style={modalStyles.typeRow}>
            {(['expense', 'income', 'both'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[modalStyles.typeBtn, form.type === t && modalStyles.typeBtnActive]}
                onPress={() => setForm((p) => ({ ...p, type: t }))}
              >
                <Text style={[modalStyles.typeBtnText, form.type === t && modalStyles.typeBtnTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Color */}
          <Text style={[modalStyles.label, { marginTop: 12 }]}>Color</Text>
          <View style={modalStyles.colorGrid}>
            {CATEGORY_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[modalStyles.colorDot, { backgroundColor: c }, form.color === c && modalStyles.colorDotSelected]}
                onPress={() => setForm((p) => ({ ...p, color: c }))}
              >
                {form.color === c && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Icon */}
          <Text style={[modalStyles.label, { marginTop: 12 }]}>Icon</Text>
          <View style={modalStyles.iconGrid}>
            {CATEGORY_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  modalStyles.iconOption,
                  { backgroundColor: form.icon === icon ? form.color + '30' : COLORS.background },
                  form.icon === icon && { borderColor: form.color, borderWidth: 2 },
                ]}
                onPress={() => setForm((p) => ({ ...p, icon }))}
              >
                <Ionicons name={icon} size={20} color={form.icon === icon ? form.color : COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={modalStyles.actions}>
            <Button title="Cancel" variant="ghost" onPress={() => setShowModal(false)} style={{ flex: 1 }} />
            <Button title="Add Category" onPress={handleAdd} style={{ flex: 1 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 12, padding: 14, marginBottom: 8, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemName: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  deleteBtn: { padding: 4 },
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
  textInput: {
    backgroundColor: COLORS.background, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 11, fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  inputError: { borderColor: COLORS.expense },
  errorText: { fontSize: 12, color: COLORS.expense, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  typeBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  typeBtnText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  typeBtnTextActive: { color: COLORS.primary },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorDot: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  colorDotSelected: { borderColor: COLORS.text },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconOption: {
    width: 44, height: 44, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
});

export default CategoryScreen;
