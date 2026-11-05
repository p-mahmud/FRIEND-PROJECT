export interface Admin {
  username: string;
  role: 'admin';
}

export interface User {
  id: string; // matches Member ID
  username: string;
  memberName: string;
  role: 'user';
}

export interface Member {
  id: string; // e.g., MEM-001
  name: string;
  phone: string;
  email: string;
  address: string;
  monthlyContribution: number;
  joinDate: string; // YYYY-MM-DD
  status: 'active' | 'inactive';
  avatar: string; // avatar initials, color, or data URL
}

export interface Collection {
  id: string; // PAY-0001
  memberId: string;
  memberName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  month: string; // e.g., "July"
  year: number; // e.g., 2026
  paymentMethod: 'Cash' | 'bKash' | 'Bank Transfer' | 'Nagad' | 'Rocket';
  status: 'Paid';
}

export interface Expense {
  id: string; // EXP-0001
  title: string;
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  receipt: string | null; // Base64 image data or file name
}

export interface DueCalculation {
  memberId: string;
  memberName: string;
  month: string;
  year: number;
  expectedAmount: number;
  paidAmount: number;
  remainingDue: number;
  overpayment: number;
}

export interface MemberDueSummary {
  memberId: string;
  memberName: string;
  totalPaid: number;
  totalExpected: number;
  remainingDue: number;
  overpayment: number;
}

export interface Transaction {
  id: string; // TXN-0001
  type: 'collection' | 'expense';
  referenceId: string; // PAY-0001 or EXP-0001
  memberOrTitle: string;
  amount: number;
  paymentMethod: string; // Cash, bKash, etc. or "N/A"
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status: string; // "Paid" or "Completed"
}

export interface SystemSettings {
  fundName: string;
  monthlyContributionAmount: number;
  currency: string; // e.g. "৳", "$", "€"
  logo: string; // text or base64 image
  theme: 'light' | 'dark';
}

export interface DashboardNotification {
  id: string;
  type: 'payment' | 'expense' | 'due' | 'summary' | 'system';
  message: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  read: boolean;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string; // YYYY-MM-DD HH:MM:SS
}

export interface DatabaseState {
  members: Member[];
  collections: Collection[];
  expenses: Expense[];
  settings: SystemSettings;
  notifications: DashboardNotification[];
  logs: ActivityLog[];
}
