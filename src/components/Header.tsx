import { useBank } from '../contexts/BankContext';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import asensoLogo from '../assets/asensologo.png'; // <- relative path fixed

export function Header() {
  const { currentUser, logout } = useBank();

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'teller1':
        return 'Teller 1 - Account Creation';
      case 'teller2':
        return 'Teller 2 - Transactions';
      case 'teller3':
        return 'Teller 3 - Loans';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={asensoLogo} alt="Asenso Bank" className="logo" />
            <div>
              <h1 className="text-blue-600">Rural Bank System</h1>
              {currentUser && (
                <p className="text-xs text-gray-500">
                  {getRoleName(currentUser.role)}
                </p>
              )}
            </div>
          </div>
          {currentUser && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm">{currentUser.name}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
