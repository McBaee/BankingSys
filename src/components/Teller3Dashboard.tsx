import { useState } from 'react';
import { useBank } from '../contexts/BankContext';
import { Header } from './Header';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { DollarSign, Calculator } from 'lucide-react';
import { toast } from 'sonner';

export function Teller3Dashboard() {
  const { accounts, createLoan, loans } = useBank();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [termYears, setTermYears] = useState('');
  const [calculation, setCalculation] = useState<{
    totalPayable: number;
    monthlyAmortization: number;
  } | null>(null);

  const approvedAccounts = accounts.filter(acc => acc.status === 'approved');
  const selectedAccountData = approvedAccounts.find(acc => acc.id === selectedAccount);

  const calculateLoan = () => {
    const amt = parseFloat(amount);
    const rate = parseFloat(interestRate);
    const years = parseFloat(termYears);

    if (isNaN(amt) || isNaN(rate) || isNaN(years) || amt <= 0 || rate < 0 || years <= 0) {
      toast.error('Please enter valid values');
      return;
    }

    const totalPayable = amt * (1 + (rate / 100) * years);
    const monthlyAmortization = totalPayable / (years * 12);

    setCalculation({ totalPayable, monthlyAmortization });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccountData || !calculation) {
      toast.error('Please calculate loan first');
      return;
    }

    createLoan({
      accountId: selectedAccount,
      customerName: selectedAccountData.customerName,
      amount: parseFloat(amount),
      interestRate: parseFloat(interestRate),
      termYears: parseFloat(termYears),
    });

    toast.success('Loan application submitted for admin approval');
    
    // Reset form
    setSelectedAccount('');
    setAmount('');
    setInterestRate('');
    setTermYears('');
    setCalculation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2>Loan Management</h2>
          <p className="text-gray-600">Process loan applications and compute interest</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Loan Application Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                New Loan Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account">Customer Account</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.customerName} - {acc.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAccountData && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Account Balance</p>
                    <p>${selectedAccountData.balance.toFixed(2)}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setCalculation(null);
                    }}
                    placeholder="Enter loan amount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => {
                      setInterestRate(e.target.value);
                      setCalculation(null);
                    }}
                    placeholder="Enter interest rate"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termYears">Term (Years)</Label>
                  <Input
                    id="termYears"
                    type="number"
                    step="1"
                    value={termYears}
                    onChange={(e) => {
                      setTermYears(e.target.value);
                      setCalculation(null);
                    }}
                    placeholder="Enter term in years"
                    required
                  />
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={calculateLoan}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Loan
                </Button>

                {calculation && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Payable:</span>
                      <span>${calculation.totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Amortization:</span>
                      <span>${calculation.monthlyAmortization.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!calculation || !selectedAccount}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Submit for Approval
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loan Applications List */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Applications ({loans.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {loans.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No loan applications yet</p>
                ) : (
                  loans.slice().reverse().map(loan => (
                    <div key={loan.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p>{loan.customerName}</p>
                          <p className="text-sm text-gray-600">{loan.id}</p>
                        </div>
                        <Badge variant={
                          loan.status === 'approved' ? 'default' :
                          loan.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {loan.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p>${loan.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Interest</p>
                          <p>{loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Term</p>
                          <p>{loan.termYears} years</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Payable</p>
                          <p>${loan.totalPayable.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Monthly Payment</p>
                        <p>${loan.monthlyAmortization.toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(loan.createdAt).toLocaleString()}
                      </p>
                      {loan.status === 'rejected' && loan.rejectionReason && (
                        <p className="text-sm text-red-600 mt-2">Reason: {loan.rejectionReason}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
