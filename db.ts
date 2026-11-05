import fs from 'fs';
import path from 'path';
import { 
  Member, 
  Collection, 
  Expense, 
  SystemSettings, 
  DashboardNotification, 
  ActivityLog, 
  DatabaseState,
  DueCalculation,
  MemberDueSummary,
  Transaction
} from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// List of months in order
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to check if a month/year is after another month/year
function isAfterMonthYear(m1: string, y1: number, m2: string, y2: number): boolean {
  if (y1 !== y2) {
    return y1 > y2;
  }
  return MONTHS.indexOf(m1) > MONTHS.indexOf(m2);
}

// Get months list from start to end (inclusive)
export function getMonthsRange(startStr: string, endYear: number, endMonthIdx: number): { month: string, year: number }[] {
  const startDate = new Date(startStr);
  let currentYear = startDate.getFullYear();
  let currentMonthIdx = startDate.getMonth(); // 0-11

  const range: { month: string, year: number }[] = [];

  while (currentYear < endYear || (currentYear === endYear && currentMonthIdx <= endMonthIdx)) {
    range.push({
      month: MONTHS[currentMonthIdx],
      year: currentYear
    });
    
    currentMonthIdx++;
    if (currentMonthIdx > 11) {
      currentMonthIdx = 0;
      currentYear++;
    }
  }

  return range;
}

const DEFAULT_SETTINGS: SystemSettings = {
  fundName: "Friends Monthly Fund",
  monthlyContributionAmount: 1000,
  currency: "৳",
  logo: "FMF",
  theme: 'light'
};

const SEED_MEMBERS: Member[] = [
  { id: "MEM-001", name: "Pavel Mahmud", phone: "01712345678", email: "pavelmahmud2020@gmail.com", address: "Mirpur 10, Dhaka", monthlyContribution: 1000, joinDate: "2026-01-01", status: "active", avatar: "PM" },
  { id: "MEM-002", name: "Sazzad Hossain", phone: "01812345679", email: "sazzad@gmail.com", address: "Dhanmondi, Dhaka", monthlyContribution: 1000, joinDate: "2026-01-15", status: "active", avatar: "SH" },
  { id: "MEM-003", name: "Fahim Chowdhury", phone: "01912345680", email: "fahim@gmail.com", address: "Banani, Dhaka", monthlyContribution: 1000, joinDate: "2026-02-01", status: "active", avatar: "FC" },
  { id: "MEM-004", name: "Jamil Ahmed", phone: "01512345681", email: "jamil@gmail.com", address: "Uttara, Dhaka", monthlyContribution: 1000, joinDate: "2026-03-01", status: "active", avatar: "JA" },
  { id: "MEM-005", name: "Tanvir Rahman", phone: "01612345682", email: "tanvir@gmail.com", address: "Gulshan, Dhaka", monthlyContribution: 1000, joinDate: "2026-01-10", status: "active", avatar: "TR" },
  { id: "MEM-006", name: "Asif Iqbal", phone: "01722345683", email: "asif.iqbal@gmail.com", address: "Mohammadpur, Dhaka", monthlyContribution: 1000, joinDate: "2026-01-05", status: "active", avatar: "AI" },
  { id: "MEM-007", name: "Mahmudul Hasan", phone: "01822345684", email: "mahmudul@gmail.com", address: "Bashundhara, Dhaka", monthlyContribution: 1000, joinDate: "2026-01-12", status: "active", avatar: "MH" },
  { id: "MEM-008", name: "Naimur Rahman", phone: "01922345685", email: "naimur@gmail.com", address: "Badda, Dhaka", monthlyContribution: 1000, joinDate: "2026-01-20", status: "active", avatar: "NR" },
  { id: "MEM-009", name: "Shakil Khan", phone: "01522345686", email: "shakil.khan@gmail.com", address: "Khilgaon, Dhaka", monthlyContribution: 1000, joinDate: "2026-02-01", status: "active", avatar: "SK" },
  { id: "MEM-010", name: "Arif Hossain", phone: "01622345687", email: "arif.hossain@gmail.com", address: "Rampura, Dhaka", monthlyContribution: 1000, joinDate: "2026-02-05", status: "active", avatar: "AH" },
  { id: "MEM-011", name: "Rakibul Islam", phone: "01732345688", email: "rakib@gmail.com", address: "Malibagh, Dhaka", monthlyContribution: 1000, joinDate: "2026-02-10", status: "active", avatar: "RI" },
  { id: "MEM-012", name: "Tamim Ahmed", phone: "01832345689", email: "tamim.ahmed@gmail.com", address: "Motijheel, Dhaka", monthlyContribution: 1000, joinDate: "2026-02-15", status: "active", avatar: "TA" },
  { id: "MEM-013", name: "Hassan Al Mamun", phone: "01932345690", email: "mamun@gmail.com", address: "Farmgate, Dhaka", monthlyContribution: 1000, joinDate: "2026-03-01", status: "active", avatar: "HM" },
  { id: "MEM-014", name: "Shahriar Kabir", phone: "01532345691", email: "shahriar@gmail.com", address: "Lalmatia, Dhaka", monthlyContribution: 1000, joinDate: "2026-03-05", status: "active", avatar: "SK" },
  { id: "MEM-015", name: "Zubaer Hossain", phone: "01632345692", email: "zubaer@gmail.com", address: "Tejgaon, Dhaka", monthlyContribution: 1000, joinDate: "2026-03-10", status: "active", avatar: "ZH" },
  { id: "MEM-016", name: "Imran Hossain", phone: "01742345693", email: "imran@gmail.com", address: "Shantinagar, Dhaka", monthlyContribution: 1000, joinDate: "2026-03-15", status: "active", avatar: "IH" },
  { id: "MEM-017", name: "Kamrul Hasan", phone: "01842345694", email: "kamrul@gmail.com", address: "Azimpur, Dhaka", monthlyContribution: 1000, joinDate: "2026-04-01", status: "active", avatar: "KH" },
  { id: "MEM-018", name: "Towhidul Islam", phone: "01942345695", email: "towhid@gmail.com", address: "Old Dhaka", monthlyContribution: 1000, joinDate: "2026-04-05", status: "active", avatar: "TI" },
  { id: "MEM-019", name: "Mehedi Hasan", phone: "01542345696", email: "mehedi@gmail.com", address: "Mirpur 11, Dhaka", monthlyContribution: 1000, joinDate: "2026-04-10", status: "active", avatar: "MH" },
  { id: "MEM-020", name: "Sabbir Rahman", phone: "01642345697", email: "sabbir@gmail.com", address: "Cantonment, Dhaka", monthlyContribution: 1000, joinDate: "2026-04-15", status: "active", avatar: "SR" },
  { id: "MEM-021", name: "Kazi Nazrul", phone: "01752345698", email: "nazrul@gmail.com", address: "Nikunja, Dhaka", monthlyContribution: 1000, joinDate: "2026-05-01", status: "active", avatar: "KN" }
];

const SEED_COLLECTIONS: Collection[] = [
  { id: "PAY-0001", memberId: "MEM-001", memberName: "Sabbir Hossen ", amount: 2500, date: "2026-07-28", time: "17:13:51", month: "May", year: 2026, paymentMethod: "Bank Transfer", status: "Paid" },
  { id: "PAY-0002", memberId: "MEM-002", memberName: "Tamim Hossain", amount: 2050, date: "2026-07-28", time: "17:14:07", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0003", memberId: "MEM-003", memberName: "Jakir Hossain", amount: 2062, date: "2026-07-28", time: "17:14:25", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0004", memberId: "MEM-004", memberName: "Rubel", amount: 2562, date: "2026-07-28", time: "17:14:45", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0005", memberId: "MEM-006", memberName: "Omor", amount: 2062, date: "2026-07-28", time: "17:15:21", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0006", memberId: "MEM-009", memberName: "Roman", amount: 1787, date: "2026-07-28", time: "17:16:07", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0007", memberId: "MEM-010", memberName: "Rajon", amount: 1463, date: "2026-07-28", time: "17:16:26", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0008", memberId: "MEM-011", memberName: "Sajib", amount: 2562, date: "2026-07-28", time: "17:16:40", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0009", memberId: "MEM-012", memberName: "Sagor", amount: 2040, date: "2026-07-28", time: "17:17:06", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0010", memberId: "MEM-013", memberName: "Muzam", amount: 2050, date: "2026-07-28", time: "17:17:20", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0011", memberId: "MEM-014", memberName: "Kayuum", amount: 2050, date: "2026-07-28", time: "17:17:33", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0012", memberId: "MEM-015", memberName: "Kawsar", amount: 2040, date: "2026-07-28", time: "17:17:44", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0013", memberId: "MEM-019", memberName: "Arif", amount: 510, date: "2026-07-28", time: "17:18:00", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0014", memberId: "MEM-021", memberName: "Pavel Mahmud ", amount: 510, date: "2026-07-28", time: "17:18:11", month: "May", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0015", memberId: "MEM-001", memberName: "Sabbir Hossen ", amount: 2000, date: "2026-07-28", time: "17:20:44", month: "June", year: 2026, paymentMethod: "Bank Transfer", status: "Paid" },
  { id: "PAY-0016", memberId: "MEM-002", memberName: "Tamim Hossain", amount: 2152, date: "2026-07-28", time: "17:21:08", month: "June", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0017", memberId: "MEM-004", memberName: "Rubel", amount: 1590, date: "2026-07-28", time: "17:21:27", month: "June", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0018", memberId: "MEM-005", memberName: "Shakil", amount: 4215, date: "2026-07-28", time: "17:21:46", month: "June", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0019", memberId: "MEM-006", memberName: "Omor", amount: 2050, date: "2026-07-28", time: "17:22:08", month: "June", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0020", memberId: "MEM-007", memberName: "Siam", amount: 1750, date: "2026-07-28", time: "17:22:21", month: "June", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0021", memberId: "MEM-011", memberName: "Sajib", amount: 2753, date: "2026-07-28", time: "17:22:49", month: "June", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0022", memberId: "MEM-013", memberName: "Muzam", amount: 1500, date: "2026-07-28", time: "17:23:10", month: "June", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0023", memberId: "MEM-015", memberName: "Kawsar", amount: 2040, date: "2026-07-28", time: "17:23:29", month: "June", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0024", memberId: "MEM-019", memberName: "Arif", amount: 510, date: "2026-07-28", time: "17:23:46", month: "June", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0025", memberId: "MEM-021", memberName: "Pavel Mahmud ", amount: 510, date: "2026-07-28", time: "17:23:56", month: "June", year: 2026, paymentMethod: "Bank Transfer", status: "Paid" },
  { id: "PAY-0026", memberId: "MEM-002", memberName: "Tamim Hossain", amount: 2169, date: "2026-07-28", time: "17:26:15", month: "July", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0027", memberId: "MEM-004", memberName: "Rubel", amount: 1590, date: "2026-07-28", time: "17:26:37", month: "July", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0028", memberId: "MEM-006", memberName: "Omor", amount: 2000, date: "2026-07-28", time: "17:26:48", month: "July", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0029", memberId: "MEM-007", memberName: "Siam", amount: 1750, date: "2026-07-28", time: "17:27:02", month: "July", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0030", memberId: "MEM-011", memberName: "Sajib", amount: 2050, date: "2026-07-28", time: "17:27:19", month: "July", year: 2026, paymentMethod: "bKash", status: "Paid" },
  { id: "PAY-0031", memberId: "MEM-019", memberName: "Arif", amount: 510, date: "2026-07-28", time: "17:27:35", month: "July", year: 2026, paymentMethod: "bKash", status: "Paid" }
];

const SEED_EXPENSES: Expense[] = [];

const SEED_NOTIFICATIONS: DashboardNotification[] = [
  { id: "NTF-001", type: "system", message: "Friends Monthly Fund System initialized successfully.", date: "2026-01-01", time: "09:00", read: true },
  { id: "NTF-002", type: "payment", message: "New Payment of ৳1000 received from Pavel Mahmud via bKash.", date: "2026-07-02", time: "15:30", read: false },
  { id: "NTF-003", type: "payment", message: "New Payment of ৳1500 received from Fahim Chowdhury via bKash.", date: "2026-07-05", time: "10:15", read: false },
  { id: "NTF-004", type: "due", message: "Monthly Due reminders calculated for June/July.", date: "2026-07-11", time: "10:00", read: false }
];

const SEED_LOGS: ActivityLog[] = [
  { id: "LOG-001", user: "pavel28", action: "System Initialize", details: "Initial database state and admin profile configured", timestamp: "2026-01-01 09:00:00" },
  { id: "LOG-002", user: "pavel28", action: "Add Member", details: "Added Sazzad Hossain (MEM-002) as active member", timestamp: "2026-01-15 11:20:00" },
  { id: "LOG-003", user: "pavel28", action: "Record Payment", details: "Recorded payment PAY-0007 for Pavel Mahmud (৳1000)", timestamp: "2026-07-02 15:31:00" },
  { id: "LOG-004", user: "pavel28", action: "Record Payment", details: "Recorded payment PAY-0018 for Fahim Chowdhury (৳1500)", timestamp: "2026-07-05 10:16:00" }
];

export function getInitialDatabase(): DatabaseState {
  return {
    members: SEED_MEMBERS,
    collections: SEED_COLLECTIONS,
    expenses: SEED_EXPENSES,
    settings: DEFAULT_SETTINGS,
    notifications: SEED_NOTIFICATIONS,
    logs: SEED_LOGS
  };
}

class DatabaseManager {
  private state: DatabaseState;

  constructor() {
    this.state = getInitialDatabase();
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (parsed && typeof parsed === 'object') {
          this.state = {
            members: parsed.members || SEED_MEMBERS,
            collections: parsed.collections || SEED_COLLECTIONS,
            expenses: parsed.expenses || SEED_EXPENSES,
            settings: parsed.settings || DEFAULT_SETTINGS,
            notifications: parsed.notifications || SEED_NOTIFICATIONS,
            logs: parsed.logs || SEED_LOGS
          };
        }
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error initializing file-based database, using in-memory state:', e);
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save to local database file:', e);
    }
  }

  // --- LOGS ---
  public addLog(user: string, action: string, details: string) {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const id = `LOG-${String(this.state.logs.length + 1).padStart(3, '0')}`;
    const newLog: ActivityLog = { id, user, action, details, timestamp };
    this.state.logs.unshift(newLog);
    this.save();
  }

  public getLogs(): ActivityLog[] {
    return this.state.logs;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): DashboardNotification[] {
    return this.state.notifications;
  }

  public addNotification(type: DashboardNotification['type'], message: string) {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const id = `NTF-${String(this.state.notifications.length + 1).padStart(3, '0')}`;
    
    this.state.notifications.unshift({
      id,
      type,
      message,
      date,
      time,
      read: false
    });
    this.save();
  }

  public markNotificationsAsRead() {
    this.state.notifications.forEach(n => n.read = true);
    this.save();
  }

  // --- SETTINGS ---
  public getSettings(): SystemSettings {
    return this.state.settings;
  }

  public updateSettings(settings: Partial<SystemSettings>, user: string) {
    this.state.settings = { ...this.state.settings, ...settings };
    this.addLog(user, 'Update Settings', `Updated configuration variables: ${Object.keys(settings).join(', ')}`);
    this.save();
    return this.state.settings;
  }

  // --- MEMBERS ---
  public getMembers(): Member[] {
    return this.state.members;
  }

  public getMemberById(id: string): Member | undefined {
    return this.state.members.find(m => m.id === id);
  }

  public addMember(memberData: Omit<Member, 'id' | 'avatar'>, user: string): Member {
    const count = this.state.members.length;
    // Find a unique ID
    let index = count + 1;
    let newId = `MEM-${String(index).padStart(3, '0')}`;
    while (this.state.members.some(m => m.id === newId)) {
      index++;
      newId = `MEM-${String(index).padStart(3, '0')}`;
    }

    const initials = memberData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const newMember: Member = {
      ...memberData,
      id: newId,
      avatar: initials || "U"
    };

    this.state.members.push(newMember);
    this.addLog(user, 'Add Member', `Added new member ${newMember.name} (${newId})`);
    this.addNotification('system', `New member ${newMember.name} joined the system.`);
    this.save();
    return newMember;
  }

  public updateMember(id: string, memberData: Partial<Member>, user: string): Member {
    const index = this.state.members.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Member with ID ${id} not found.`);
    }

    const previous = this.state.members[index];
    const initials = memberData.name 
      ? memberData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : previous.avatar;

    this.state.members[index] = {
      ...previous,
      ...memberData,
      avatar: initials
    };

    // Update names in payment history as well for consistency
    if (memberData.name) {
      this.state.collections.forEach(c => {
        if (c.memberId === id) {
          c.memberName = memberData.name!;
        }
      });
    }

    this.addLog(user, 'Edit Member', `Updated member profile details for ${previous.name} (${id})`);
    this.save();
    return this.state.members[index];
  }

  public deleteMember(id: string, user: string) {
    const member = this.getMemberById(id);
    if (!member) {
      throw new Error(`Member with ID ${id} not found.`);
    }

    this.state.members = this.state.members.filter(m => m.id !== id);
    // Note: In real relational setup we might restrict or delete cascade.
    // Here we keep collections intact but flag them as deleted or keep name
    this.addLog(user, 'Delete Member', `Removed member ${member.name} (${id})`);
    this.save();
  }

  // --- COLLECTIONS ---
  public getCollections(): Collection[] {
    return this.state.collections;
  }

  public addCollection(
    data: { 
      memberId: string; 
      amount: number; 
      paymentMethod: Collection['paymentMethod'];
      month?: string;
      year?: number;
    }, 
    user: string
  ): Collection {
    const member = this.getMemberById(data.memberId);
    if (!member) {
      throw new Error(`Member ${data.memberId} does not exist.`);
    }

    const count = this.state.collections.length;
    let index = count + 1;
    let newId = `PAY-${String(index).padStart(4, '0')}`;
    while (this.state.collections.some(c => c.id === newId)) {
      index++;
      newId = `PAY-${String(index).padStart(4, '0')}`;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const selectedMonth = data.month || MONTHS[now.getMonth()];
    const selectedYear = data.year || now.getFullYear();

    const newCollection: Collection = {
      id: newId,
      memberId: data.memberId,
      memberName: member.name,
      amount: data.amount,
      date: dateStr,
      time: timeStr,
      month: selectedMonth,
      year: selectedYear,
      paymentMethod: data.paymentMethod,
      status: 'Paid'
    };

    this.state.collections.push(newCollection);
    this.addLog(user, 'Record Collection', `Collected ৳${data.amount} (${selectedMonth} ${selectedYear}) from ${member.name} via ${data.paymentMethod} (${newId})`);
    this.addNotification('payment', `New Payment of ${this.state.settings.currency}${data.amount} (${selectedMonth} ${selectedYear}) received from ${member.name} via ${data.paymentMethod}.`);
    this.save();
    return newCollection;
  }

  public deleteCollection(id: string, user: string) {
    const col = this.state.collections.find(c => c.id === id);
    if (!col) {
      throw new Error(`Collection record ${id} not found.`);
    }

    this.state.collections = this.state.collections.filter(c => c.id !== id);
    this.addLog(user, 'Delete Collection', `Removed collection payment record ${id} of ৳${col.amount} for ${col.memberName}`);
    this.save();
  }

  // --- EXPENSES ---
  public getExpenses(): Expense[] {
    return this.state.expenses;
  }

  public addExpense(expenseData: Omit<Expense, 'id' | 'date' | 'time'>, user: string): Expense {
    const count = this.state.expenses.length;
    let index = count + 1;
    let newId = `EXP-${String(index).padStart(4, '0')}`;
    while (this.state.expenses.some(e => e.id === newId)) {
      index++;
      newId = `EXP-${String(index).padStart(4, '0')}`;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newExpense: Expense = {
      ...expenseData,
      id: newId,
      date: dateStr,
      time: timeStr
    };

    this.state.expenses.push(newExpense);
    this.addLog(user, 'Add Expense', `Added expense "${newExpense.title}" of ৳${newExpense.amount} under category ${newExpense.category}`);
    this.addNotification('expense', `New Expense added: "${newExpense.title}" (Amount: ${this.state.settings.currency}${newExpense.amount}).`);
    this.save();
    return newExpense;
  }

  public deleteExpense(id: string, user: string) {
    const expense = this.state.expenses.find(e => e.id === id);
    if (!expense) {
      throw new Error(`Expense ${id} not found.`);
    }

    this.state.expenses = this.state.expenses.filter(e => e.id !== id);
    this.addLog(user, 'Delete Expense', `Removed expense "${expense.title}" (${id}) of ৳${expense.amount}`);
    this.save();
  }

  // --- CALCULATE DUE MANAGEMENT ---
  // Calculates due by matching payment collections to member IDs and period month/years
  public calculateDues(asOfDate: Date = new Date("2026-07-11")): { summaries: MemberDueSummary[], breakdown: DueCalculation[] } {
    const currentYear = asOfDate.getFullYear();
    const currentMonthIdx = asOfDate.getMonth(); // 0-11

    // Determine max month/year from collections to encompass recorded payment periods
    let maxYear = currentYear;
    let maxMonthIdx = currentMonthIdx;
    this.state.collections.forEach(c => {
      if (c.year && c.year > maxYear) {
        maxYear = c.year;
      }
      if (c.month) {
        const idx = MONTHS.indexOf(c.month);
        if (idx !== -1) {
          const cYr = c.year || currentYear;
          if (cYr > maxYear || (cYr === maxYear && idx > maxMonthIdx)) {
            maxYear = cYr;
            maxMonthIdx = idx;
          }
        }
      }
    });

    const summaries: MemberDueSummary[] = [];
    const breakdown: DueCalculation[] = [];

    this.state.members.forEach(member => {
      // Find all payments made by this member using unique memberId
      const memberPayments = this.state.collections
        .filter(c => c.memberId === member.id && c.status === 'Paid');

      // Total payments
      const totalPaid = memberPayments.reduce((sum, p) => sum + p.amount, 0);

      // Determine expected payments list
      let memberExpectedRange: { month: string, year: number }[] = [];
      try {
        memberExpectedRange = getMonthsRange(member.joinDate, maxYear, maxMonthIdx);
      } catch (e) {
        memberExpectedRange = [{ month: MONTHS[currentMonthIdx], year: currentYear }];
      }

      const defaultTarget = this.state.settings.monthlyContributionAmount || 1000;
      const expectedPerMonth = member.monthlyContribution > 0 ? member.monthlyContribution : defaultTarget;
      const totalExpected = memberExpectedRange.reduce((sum) => sum + expectedPerMonth, 0);

      // Breakdown by month/period
      memberExpectedRange.forEach((period) => {
        const expected = expectedPerMonth;

        // Sum all payments for this member in this month/period by unique memberId and month/year
        const periodPayments = memberPayments.filter(c => {
          if (c.month && c.year) {
            return c.month.toLowerCase() === period.month.toLowerCase() && Number(c.year) === Number(period.year);
          } else if (c.date) {
            const parts = c.date.split('-');
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10);
              const mIdx = parseInt(parts[1], 10) - 1;
              if (y === Number(period.year) && MONTHS[mIdx] && MONTHS[mIdx].toLowerCase() === period.month.toLowerCase()) {
                return true;
              }
            }
          }
          return false;
        });

        const paidForThisPeriod = periodPayments.reduce((sum, p) => sum + p.amount, 0);
        const remainingDue = Math.max(0, expected - paidForThisPeriod);
        const overpayment = Math.max(0, paidForThisPeriod - expected);

        breakdown.push({
          memberId: member.id,
          memberName: member.name,
          month: period.month,
          year: period.year,
          expectedAmount: expected,
          paidAmount: paidForThisPeriod,
          remainingDue: remainingDue,
          overpayment: overpayment
        });
      });

      const remainingDueSum = Math.max(0, totalExpected - totalPaid);
      const overpaymentSum = Math.max(0, totalPaid - totalExpected);

      summaries.push({
        memberId: member.id,
        memberName: member.name,
        totalPaid,
        totalExpected,
        remainingDue: remainingDueSum,
        overpayment: overpaymentSum
      });
    });

    return { summaries, breakdown };
  }

  // --- TRANSCTIONS COMBINED VIEW ---
  public getTransactions(): Transaction[] {
    const txns: Transaction[] = [];

    // Collections
    this.state.collections.forEach(c => {
      txns.push({
        id: `TXN-P${c.id.split('-')[1]}`,
        type: 'collection',
        referenceId: c.id,
        memberOrTitle: c.memberName,
        amount: c.amount,
        paymentMethod: c.paymentMethod,
        date: c.date,
        time: c.time,
        status: 'Paid'
      });
    });

    // Expenses
    this.state.expenses.forEach(e => {
      txns.push({
        id: `TXN-E${e.id.split('-')[1]}`,
        type: 'expense',
        referenceId: e.id,
        memberOrTitle: e.title,
        amount: e.amount,
        paymentMethod: 'N/A',
        date: e.date,
        time: `${e.time}:00`,
        status: 'Completed'
      });
    });

    // Sort transactions by date and time descending
    return txns.sort((a, b) => {
      const dtA = new Date(`${a.date}T${a.time}`);
      const dtB = new Date(`${b.date}T${b.time}`);
      return dtB.getTime() - dtA.getTime();
    });
  }

  // --- RECOVERY (BACKUP & RESTORE) ---
  public backupDatabase(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public restoreDatabase(backupStr: string, user: string): boolean {
    try {
      const parsed = JSON.parse(backupStr);
      if (
        parsed && 
        Array.isArray(parsed.members) && 
        Array.isArray(parsed.collections) && 
        Array.isArray(parsed.expenses)
      ) {
        this.state = {
          members: parsed.members,
          collections: parsed.collections,
          expenses: parsed.expenses,
          settings: parsed.settings || DEFAULT_SETTINGS,
          notifications: parsed.notifications || SEED_NOTIFICATIONS,
          logs: parsed.logs || []
        };
        this.addLog(user, 'Restore Database', 'Restored system database from backup archive file.');
        this.addNotification('system', 'Database restored successfully from file archive.');
        this.save();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse database backup string:', e);
      return false;
    }
  }

  // Helper to completely clear/reset database
  public resetDatabase(user: string) {
    this.state = getInitialDatabase();
    this.addLog(user, 'Reset Database', 'Reset database to initial seed settings');
    this.save();
  }
}

export const db = new DatabaseManager();
