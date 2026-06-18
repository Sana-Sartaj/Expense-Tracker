import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { MoreStackParamList } from '../../types';
import { getUserProfileApi } from '../../api/userApi';
import { useAuthStore } from '../../store/authStore';
import COLORS from '../../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>;
};

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

const MoreScreen: React.FC<Props> = ({ navigation }) => {
  const userId = useAuthStore((s) => s.userId) ?? '';
  const logout = useAuthStore((s) => s.logout);

  const { data: profile } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfileApi(userId),
    enabled: !!userId,
    staleTime: 300_000,
    retry: false,
  });

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ],
    );
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Finance',
      items: [
        {
          id: 'categories',
          icon: 'grid-outline',
          label: 'Categories',
          subtitle: 'Manage expense & income categories',
          onPress: () => navigation.navigate('Categories'),
        },
        {
          id: 'budget',
          icon: 'wallet-outline',
          label: 'Budget Tracker',
          subtitle: 'Set monthly spending limits',
          onPress: () => navigation.navigate('Budget'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'userid',
          icon: 'person-circle-outline',
          label: 'User ID',
          subtitle: userId || 'Not available',
          onPress: () => {},
        },
        {
          id: 'logout',
          icon: 'log-out-outline',
          label: 'Sign Out',
          onPress: handleLogout,
          danger: true,
        },
      ],
    },
  ];

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : 'User';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>{displayName}</Text>
          {profile?.email ? (
            <Text style={styles.email}>{profile.email}</Text>
          ) : null}
        </View>
      </View>

      {/* Menu sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  idx < section.items.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.menuIcon,
                  { backgroundColor: item.danger ? COLORS.expenseLight : COLORS.primaryLight },
                ]}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? COLORS.expense : COLORS.primary}
                  />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                    {item.label}
                  </Text>
                  {item.subtitle ? (
                    <Text style={styles.menuSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
                {!item.danger && (
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* App info */}
      <View style={styles.appInfo}>
        <Ionicons name="wallet" size={20} color={COLORS.textSecondary} />
        <Text style={styles.appInfoText}>ExpenseTracker v1.0.0</Text>
        <Text style={styles.appInfoSubtext}>Academic Project</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  profileInfo: { flex: 1, gap: 4 },
  displayName: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionCard: {
    backgroundColor: COLORS.card, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuTextWrap: { flex: 1, gap: 2 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  menuLabelDanger: { color: COLORS.expense },
  menuSubtitle: { fontSize: 12, color: COLORS.textSecondary },

  appInfo: { alignItems: 'center', gap: 4, marginTop: 8, paddingVertical: 16 },
  appInfoText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  appInfoSubtext: { fontSize: 12, color: COLORS.textSecondary },
});

export default MoreScreen;
