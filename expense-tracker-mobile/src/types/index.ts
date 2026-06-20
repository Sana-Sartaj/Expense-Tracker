// ─────────────────────────────────────────────
// BACKEND DTO TYPES  (match server field names)
// ─────────────────────────────────────────────

/** Sent to POST /auth/v1/login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Returned by POST /auth/v1/login */
export interface LoginResponse {
  accessToken: string;
  token: string;       // refresh token
  userId?: string;     // some backends embed userId
}

/** Sent to POST /auth/v1/signup */
export interface RegisterRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: number;
}

/** Sent to POST /auth/v1/refreshToken */
export interface RefreshTokenRequest {
  token: string;
}

/** Returned by POST /auth/v1/refreshToken */
export interface RefreshTokenResponse {
  accessToken: string;
  token: string;
}

/** Sent to / returned from POST /user/v1/createUpdate */
export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number: number;
  email: string;
  profile_pic?: string;
}

/**
 * Sent to POST /expense/v1/add and PUT /expense/v1/update
 * Also returned from GET /expense/v1/{userId}
 *
 * NOTE: `transactionType` is an extra field we add.
 * Java's Jackson ignores unknown fields by default so
 * sending it is safe.  When the backend returns the list,
 * if transactionType is absent we infer it from the category.
 */
export interface TransactionRequest {
  userId: string;
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  date: string;              // "YYYY-MM-DD"
  transactionType: TransactionType;
  externalId?: string;       // required for updates
}

/** Returned from GET /expense/v1/{userId} */
export interface Transaction {
  externalId: string;
  userId: string;
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  transactionType: TransactionType;
}

// ─────────────────────────────────────────────
// FRONTEND-ONLY TYPES (no backend API)
// ─────────────────────────────────────────────

export type TransactionType = 'EXPENSE' | 'INCOME';

/** Stored locally in Zustand + AsyncStorage */
export interface Category {
  id: string;
  name: string;
  icon: string;       // Ionicons name
  color: string;      // hex
  type: 'expense' | 'income' | 'both';
}

/** Stored locally in Zustand + AsyncStorage */
export interface Budget {
  id: string;
  category: string;   // matches Category.name
  limit: number;
  month: string;      // "YYYY-MM"
}

// ─────────────────────────────────────────────
// NAVIGATION PARAM LISTS
// ─────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Income: undefined;
  Analytics: undefined;
  More: undefined;
};

export type ExpenseStackParamList = {
  ExpenseList: undefined;
  AddEditExpense: { transaction?: Transaction } | undefined;
};

export type IncomeStackParamList = {
  IncomeList: undefined;
  AddEditIncome: { transaction?: Transaction } | undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Categories: undefined;
  Budget: undefined;
  SmartAdd: undefined;
};

// ─────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────

/** Standard error shape returned by GlobalExceptionHandler */
export interface ApiError {
  requestId?: string;
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

/** Monthly stats computed client-side from transactions */
export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}

/** Category breakdown for pie chart */
export interface CategoryStat {
  category: string;
  total: number;
  percentage: number;
  color: string;
}
