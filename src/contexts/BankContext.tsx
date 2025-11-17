import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'teller1' | 'teller2' | 'teller3' | 'customer';
export type AccountStatus = 'pending' | 'approved' | 'rejected';
export type LoanStatus = 'pending' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_out' | 'transfer_in' | 'loan_disbursement' | 'loan_payment';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Account {
  id: string;
  customerId: string;
  customerName: string;
  dateOfBirth: string;
  address: string;
  idType: string;
  idNumber: string;
  balance: number;
  status: AccountStatus;
  createdAt: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  relatedAccountId?: string;
  processedBy: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  accountId: string;
  customerName: string;
  amount: number;
  interestRate: number;
  termYears: number;
  totalPayable: number;
  monthlyAmortization: number;
  status: LoanStatus;
  createdAt: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

interface BankContextType {
  currentUser: User | null;
  users: User[];
  accounts: Account[];
  transactions: Transaction[];
  loans: Loan[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createAccount: (account: Omit<Account, 'id' | 'balance' | 'status' | 'createdAt'>) => void;
  approveAccount: (accountId: string, adminId: string) => void;
  rejectAccount: (accountId: string, adminId: string, reason: string) => void;
  deposit: (accountId: string, amount: number, tellerId: string) => void;
  withdraw: (accountId: string, amount: number, tellerId: string) => void;
  transfer: (fromAccountId: string, toAccountId: string, amount: number, tellerId: string) => void;
  createLoan: (loan: Omit<Loan, 'id' | 'status' | 'createdAt' | 'totalPayable' | 'monthlyAmortization'>) => void;
  approveLoan: (loanId: string, adminId: string) => void;
  rejectLoan: (loanId: string, adminId: string, reason: string) => void;
  getAccountById: (accountId: string) => Account | undefined;
  getTransactionsByAccountId: (accountId: string) => Transaction[];
  getLoansByAccountId: (accountId: string) => Loan[];
}

const BankContext = createContext<BankContextType | undefined>(undefined);

const STORAGE_KEY = 'banking_system_data';

const initialUsers: User[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  { id: '2', username: 'teller1', password: 'teller1', role: 'teller1', name: 'Account Teller' },
  { id: '3', username: 'teller2', password: 'teller2', role: 'teller2', name: 'Transaction Teller' },
  { id: '4', username: 'teller3', password: 'teller3', role: 'teller3', name: 'Loan Teller' },
];

export function BankProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setUsers(data.users || initialUsers);
        setAccounts(data.accounts || []);
        setTransactions(data.transactions || []);
        setLoans(data.loans || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const data = {
      users,
      accounts,
      transactions,
      loans,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [users, accounts, transactions, loans]);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createAccount = (accountData: Omit<Account, 'id' | 'balance' | 'status' | 'createdAt'>) => {
    const newAccount: Account = {
      ...accountData,
      id: `ACC${Date.now()}`,
      balance: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Create user credentials for customer
    const newUser: User = {
      id: newAccount.customerId,
      username: newAccount.customerId,
      password: 'customer123', // Default password
      role: 'customer',
      name: newAccount.customerName,
    };

    setAccounts(prev => [...prev, newAccount]);
    setUsers(prev => [...prev, newUser]);
  };

  const approveAccount = (accountId: string, adminId: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: 'approved' as AccountStatus, approvedBy: adminId }
        : acc
    ));
  };

  const rejectAccount = (accountId: string, adminId: string, reason: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: 'rejected' as AccountStatus, rejectedBy: adminId, rejectionReason: reason }
        : acc
    ));
  };

  const deposit = (accountId: string, amount: number, tellerId: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        const newBalance = acc.balance + amount;
        const transaction: Transaction = {
          id: `TXN${Date.now()}`,
          accountId,
          type: 'deposit',
          amount,
          balanceAfter: newBalance,
          description: 'Cash Deposit',
          processedBy: tellerId,
          createdAt: new Date().toISOString(),
        };
        setTransactions(prev => [...prev, transaction]);
        return { ...acc, balance: newBalance };
      }
      return acc;
    }));
  };

  const withdraw = (accountId: string, amount: number, tellerId: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId && acc.balance >= amount) {
        const newBalance = acc.balance - amount;
        const transaction: Transaction = {
          id: `TXN${Date.now()}`,
          accountId,
          type: 'withdrawal',
          amount,
          balanceAfter: newBalance,
          description: 'Cash Withdrawal',
          processedBy: tellerId,
          createdAt: new Date().toISOString(),
        };
        setTransactions(prev => [...prev, transaction]);
        return { ...acc, balance: newBalance };
      }
      return acc;
    }));
  };

  const transfer = (fromAccountId: string, toAccountId: string, amount: number, tellerId: string) => {
    const fromAccount = accounts.find(acc => acc.id === fromAccountId);
    const toAccount = accounts.find(acc => acc.id === toAccountId);

    if (!fromAccount || !toAccount || fromAccount.balance < amount) {
      return;
    }

    setAccounts(prev => prev.map(acc => {
      if (acc.id === fromAccountId) {
        const newBalance = acc.balance - amount;
        const transaction: Transaction = {
          id: `TXN${Date.now()}_OUT`,
          accountId: fromAccountId,
          type: 'transfer_out',
          amount,
          balanceAfter: newBalance,
          description: `Transfer to ${toAccount.customerName}`,
          relatedAccountId: toAccountId,
          processedBy: tellerId,
          createdAt: new Date().toISOString(),
        };
        setTransactions(prev => [...prev, transaction]);
        return { ...acc, balance: newBalance };
      }
      if (acc.id === toAccountId) {
        const newBalance = acc.balance + amount;
        const transaction: Transaction = {
          id: `TXN${Date.now()}_IN`,
          accountId: toAccountId,
          type: 'transfer_in',
          amount,
          balanceAfter: newBalance,
          description: `Transfer from ${fromAccount.customerName}`,
          relatedAccountId: fromAccountId,
          processedBy: tellerId,
          createdAt: new Date().toISOString(),
        };
        setTimeout(() => {
          setTransactions(prev => [...prev, transaction]);
        }, 10);
        return { ...acc, balance: newBalance };
      }
      return acc;
    }));
  };

  const createLoan = (loanData: Omit<Loan, 'id' | 'status' | 'createdAt' | 'totalPayable' | 'monthlyAmortization'>) => {
    const totalPayable = loanData.amount * (1 + (loanData.interestRate / 100) * loanData.termYears);
    const monthlyAmortization = totalPayable / (loanData.termYears * 12);

    const newLoan: Loan = {
      ...loanData,
      id: `LOAN${Date.now()}`,
      totalPayable,
      monthlyAmortization,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setLoans(prev => [...prev, newLoan]);
  };

  const approveLoan = (loanId: string, adminId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    setLoans(prev => prev.map(l => 
      l.id === loanId 
        ? { ...l, status: 'approved' as LoanStatus, approvedBy: adminId }
        : l
    ));

    // Disburse loan amount to account
    setAccounts(prev => prev.map(acc => {
      if (acc.id === loan.accountId) {
        const newBalance = acc.balance + loan.amount;
        const transaction: Transaction = {
          id: `TXN${Date.now()}`,
          accountId: loan.accountId,
          type: 'loan_disbursement',
          amount: loan.amount,
          balanceAfter: newBalance,
          description: `Loan Disbursement - ${loan.id}`,
          processedBy: adminId,
          createdAt: new Date().toISOString(),
        };
        setTransactions(prev => [...prev, transaction]);
        return { ...acc, balance: newBalance };
      }
      return acc;
    }));
  };

  const rejectLoan = (loanId: string, adminId: string, reason: string) => {
    setLoans(prev => prev.map(l => 
      l.id === loanId 
        ? { ...l, status: 'rejected' as LoanStatus, rejectedBy: adminId, rejectionReason: reason }
        : l
    ));
  };

  const getAccountById = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId);
  };

  const getTransactionsByAccountId = (accountId: string) => {
    return transactions.filter(txn => txn.accountId === accountId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getLoansByAccountId = (accountId: string) => {
    return loans.filter(loan => loan.accountId === accountId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  return (
    <BankContext.Provider value={{
      currentUser,
      users,
      accounts,
      transactions,
      loans,
      login,
      logout,
      createAccount,
      approveAccount,
      rejectAccount,
      deposit,
      withdraw,
      transfer,
      createLoan,
      approveLoan,
      rejectLoan,
      getAccountById,
      getTransactionsByAccountId,
      getLoansByAccountId,
    }}>
      {children}
    </BankContext.Provider>
  );
}

export function useBank() {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBank must be used within BankProvider');
  }
  return context;
}
