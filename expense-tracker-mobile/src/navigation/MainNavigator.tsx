import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import COLORS from '../constants/colors';
import {
  MainTabParamList,
  ExpenseStackParamList,
  IncomeStackParamList,
  MoreStackParamList,
} from '../types';

// ── Screens ───────────────────────────────────────────────────────
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ExpenseListScreen from '../screens/expenses/ExpenseListScreen';
import AddEditExpenseScreen from '../screens/expenses/AddEditExpenseScreen';
import IncomeListScreen from '../screens/income/IncomeListScreen';
import AddEditIncomeScreen from '../screens/income/AddEditIncomeScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import MoreScreen from '../screens/more/MoreScreen';
import CategoryScreen from '../screens/categories/CategoryScreen';
import BudgetScreen from '../screens/budget/BudgetScreen';

// ── Stack navigators for tabs that need sub-screens ───────────────
const ExpenseStack = createNativeStackNavigator<ExpenseStackParamList>();
const IncomeStack = createNativeStackNavigator<IncomeStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const ExpenseNavigator = () => (
  <ExpenseStack.Navigator>
    <ExpenseStack.Screen
      name="ExpenseList"
      component={ExpenseListScreen}
      options={{ title: 'Expenses' }}
    />
    <ExpenseStack.Screen
      name="AddEditExpense"
      component={AddEditExpenseScreen}
      options={({ route }) =>
        ({ title: route.params?.transaction ? 'Edit Expense' : 'Add Expense' })
      }
    />
  </ExpenseStack.Navigator>
);

const IncomeNavigator = () => (
  <IncomeStack.Navigator>
    <IncomeStack.Screen
      name="IncomeList"
      component={IncomeListScreen}
      options={{ title: 'Income' }}
    />
    <IncomeStack.Screen
      name="AddEditIncome"
      component={AddEditIncomeScreen}
      options={({ route }) =>
        ({ title: route.params?.transaction ? 'Edit Income' : 'Add Income' })
      }
    />
  </IncomeStack.Navigator>
);

const MoreNavigator = () => (
  <MoreStack.Navigator>
    <MoreStack.Screen name="MoreMenu" component={MoreScreen} options={{ title: 'More' }} />
    <MoreStack.Screen name="Categories" component={CategoryScreen} options={{ title: 'Categories' }} />
    <MoreStack.Screen name="Budget" component={BudgetScreen} options={{ title: 'Budget Tracker' }} />
  </MoreStack.Navigator>
);

// ── Bottom tab navigator ──────────────────────────────────────────
const MainNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        const icons: Record<string, [string, string]> = {
          Home:      ['home',              'home-outline'],
          Expenses:  ['arrow-down-circle', 'arrow-down-circle-outline'],
          Income:    ['arrow-up-circle',   'arrow-up-circle-outline'],
          Analytics: ['bar-chart',         'bar-chart-outline'],
          More:      ['grid',              'grid-outline'],
        };
        const [filled, outline] = icons[route.name] ?? ['help', 'help-outline'];
        const name = (focused ? filled : outline) as keyof typeof Ionicons.glyphMap;
        return <Ionicons name={name} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      tabBarStyle: {
        backgroundColor: COLORS.card,
        borderTopColor: COLORS.border,
        paddingBottom: 5,
        height: 60,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home"      component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="Expenses"  component={ExpenseNavigator} />
    <Tab.Screen name="Income"    component={IncomeNavigator} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="More"      component={MoreNavigator} />
  </Tab.Navigator>
);

export default MainNavigator;
