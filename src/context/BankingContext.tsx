import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'teller1' | 'teller2' | 'teller3' | 'customer';
  accountId?: string;
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';
  amount: number;
  description: string;
  fromAccount?: string;
  toAccount?: string;
  performedBy: string;
  createdAt: string;
  balanceAfter: number;
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface BankingContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  accounts: Account[];
  transactions: Transaction[];
  loans: Loan[];
  createAccount: (account: Omit<Account, 'id' | 'balance' | 'status' | 'createdAt'>) => void;
  approveAccount: (accountId: string, adminId: string) => void;
  rejectAccount: (accountId: string, adminId: string) => void;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  createLoan: (loan: Omit<Loan, 'id' | 'status' | 'createdAt' | 'totalPayable' | 'monthlyAmortization'>) => void;
  approveLoan: (loanId: string, adminId: string) => void;
  rejectLoan: (loanId: string, adminId: string) => void;
  getAccountById: (accountId: string) => Account | undefined;
  getTransactionsByAccount: (accountId: string) => Transaction[];
  getLoansByAccount: (accountId: string) => Loan[];
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

// Default users for demo
const DEFAULT_USERS: User[] = [
  { id: '1', username: 'admin', role: 'admin' },
  { id: '2', username: 'teller1', role: 'teller1' },
  { id: '3', username: 'teller2', role: 'teller2' },
  { id: '4', username: 'teller3', role: 'teller3' },
];

export function BankingProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAccounts = localStorage.getItem('banking_accounts');
    const savedTransactions = localStorage.getItem('banking_transactions');
    const savedLoans = localStorage.getItem('banking_loans');
    const savedUsers = localStorage.getItem('banking_users');

    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedLoans) setLoans(JSON.parse(savedLoans));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('banking_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('banking_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('banking_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('banking_users', JSON.stringify(users));
  }, [users]);

  const login = (username: string, password: string): boolean => {
    // Simple auth - in production this would be secure
    const user = users.find(u => u.username === username);
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
    setAccounts(prev => [...prev, newAccount]);

    // Create customer user account
    const newUser: User = {
      id: newAccount.customerId,
      username: newAccount.customerId,
      role: 'customer',
      accountId: newAccount.id,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const approveAccount = (accountId: string, adminId: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: 'approved', approvedBy: adminId, approvedAt: new Date().toISOString() }
        : acc
    ));
  };

  const rejectAccount = (accountId: string, adminId: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: 'rejected', approvedBy: adminId, approvedAt: new Date().toISOString() }
        : acc
    ));
  };

  const createTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `TXN${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [...prev, newTransaction]);

    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === transactionData.accountId) {
        return { ...acc, balance: transactionData.balanceAfter };
      }
      // Handle transfer - update recipient balance
      if (transactionData.type === 'transfer_in' && transactionData.toAccount === acc.id) {
        return { ...acc, balance: acc.balance + transactionData.amount };
      }
      return acc;
    }));
  };

  const createLoan = (loanData: Omit<Loan, 'id' | 'status' | 'createdAt' | 'totalPayable' | 'monthlyAmortization'>) => {
    // Calculate loan details
    const principal = loanData.amount;
    const rate = loanData.interestRate / 100;
    const time = loanData.termYears;
    const totalPayable = principal * (1 + rate * time);
    const monthlyAmortization = totalPayable / (time * 12);

    const newLoan: Loan = {
      ...loanData,
      id: `LOAN${Date.now()}`,
      status: 'pending',
      totalPayable,
      monthlyAmortization,
      createdAt: new Date().toISOString(),
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const approveLoan = (loanId: string, adminId: string) => {
    setLoans(prev => prev.map(loan => 
      loan.id === loanId 
        ? { ...loan, status: 'approved', approvedBy: adminId, approvedAt: new Date().toISOString() }
        : loan
    ));

    // Add loan amount to account balance
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
      const account = accounts.find(a => a.id === loan.accountId);
      if (account) {
        createTransaction({
          accountId: loan.accountId,
          type: 'deposit',
          amount: loan.amount,
          description: `Loan Approved - ${loan.id}`,
          performedBy: adminId,
          balanceAfter: account.balance + loan.amount,
        });
      }
    }
  };

  const rejectLoan = (loanId: string, adminId: string) => {
    setLoans(prev => prev.map(loan => 
      loan.id === loanId 
        ? { ...loan, status: 'rejected', approvedBy: adminId, approvedAt: new Date().toISOString() }
        : loan
    ));
  };

  const getAccountById = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId);
  };

  const getTransactionsByAccount = (accountId: string) => {
    return transactions.filter(txn => txn.accountId === accountId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getLoansByAccount = (accountId: string) => {
    return loans.filter(loan => loan.accountId === accountId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const value: BankingContextType = {
    currentUser,
    login,
    logout,
    accounts,
    transactions,
    loans,
    createAccount,
    approveAccount,
    rejectAccount,
    createTransaction,
    createLoan,
    approveLoan,
    rejectLoan,
    getAccountById,
    getTransactionsByAccount,
    getLoansByAccount,
  };

  return <BankingContext.Provider value={value}>{children}</BankingContext.Provider>;
}

export function useBanking() {
  const context = useContext(BankingContext);
  if (context === undefined) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
}
