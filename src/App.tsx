import { useState, useEffect } from 'react';
import { BankProvider } from './contexts/BankContext';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { Teller1Dashboard } from './components/Teller1Dashboard';
import { Teller2Dashboard } from './components/Teller2Dashboard';
import { Teller3Dashboard } from './components/Teller3Dashboard';
import { CustomerDashboard } from './components/CustomerDashboard';
import { useBank } from './contexts/BankContext';

function AppContent() {
  const { currentUser, logout } = useBank();

  if (!currentUser) {
    return <LoginPage />;
  }

  switch (currentUser.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teller1':
      return <Teller1Dashboard />;
    case 'teller2':
      return <Teller2Dashboard />;
    case 'teller3':
      return <Teller3Dashboard />;
    case 'customer':
      return <CustomerDashboard />;
    default:
      return <LoginPage />;
  }
}

export default function App() {
  return (
    <BankProvider>
      <AppContent />
    </BankProvider>
  );
}
