import { useState } from 'react';
import { useBank } from '../contexts/BankContext';
import { Header } from './Header';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

export function Teller2Dashboard() {
  const { accounts, deposit, withdraw, transfer, currentUser, getTransactionsByAccountId } = useBank();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');

  const approvedAccounts = accounts.filter(acc => acc.status === 'approved');
  const selectedAccountData = approvedAccounts.find(acc => acc.id === selectedAccount);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    
    if (!selectedAccount || isNaN(amt) || amt <= 0) {
      toast.error('Please select account and enter valid amount');
      return;
    }

    if (currentUser) {
      deposit(selectedAccount, amt, currentUser.id);
      toast.success(`Deposited $${amt.toFixed(2)} successfully`);
      setAmount('');
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    
    if (!selectedAccount || isNaN(amt) || amt <= 0) {
      toast.error('Please select account and enter valid amount');
      return;
    }

    const account = approvedAccounts.find(acc => acc.id === selectedAccount);
    if (account && account.balance < amt) {
      toast.error('Insufficient balance');
      return;
    }

    if (currentUser) {
      withdraw(selectedAccount, amt, currentUser.id);
      toast.success(`Withdrawn $${amt.toFixed(2)} successfully`);
      setAmount('');
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    
    if (!selectedAccount || !transferTo || isNaN(amt) || amt <= 0) {
      toast.error('Please select both accounts and enter valid amount');
      return;
    }

    if (selectedAccount === transferTo) {
      toast.error('Cannot transfer to the same account');
      return;
    }

    const account = approvedAccounts.find(acc => acc.id === selectedAccount);
    if (account && account.balance < amt) {
      toast.error('Insufficient balance');
      return;
    }

    if (currentUser) {
      transfer(selectedAccount, transferTo, amt, currentUser.id);
      toast.success(`Transferred $${amt.toFixed(2)} successfully`);
      setAmount('');
      setTransferTo('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2>Transaction Management</h2>
          <p className="text-gray-600">Handle deposits, withdrawals, and transfers</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Account Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Account</Label>
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
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <h3 className="text-blue-600">
                      ${selectedAccountData.balance.toFixed(2)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">{selectedAccountData.customerName}</p>
                    <p className="text-xs text-gray-500">{selectedAccountData.id}</p>
                  </div>
                )}

                {selectedAccount && (
                  <div>
                    <p className="text-sm mb-2">Recent Transactions</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {getTransactionsByAccountId(selectedAccount).slice(0, 5).map(txn => (
                        <div key={txn.id} className="p-2 border rounded text-sm">
                          <p className={txn.type.includes('in') || txn.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                            {txn.type.includes('in') || txn.type === 'deposit' ? '+' : '-'}${txn.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">{txn.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="deposit">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  <TabsTrigger value="transfer">Transfer</TabsTrigger>
                </TabsList>

                <TabsContent value="deposit">
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="p-6 border-2 border-dashed rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <ArrowDownLeft className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3>Deposit Money</h3>
                          <p className="text-sm text-gray-600">Add funds to account</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="depositAmount">Amount</Label>
                          <Input
                            id="depositAmount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={!selectedAccount}>
                          <ArrowDownLeft className="w-4 h-4 mr-2" />
                          Process Deposit
                        </Button>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="withdraw">
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="p-6 border-2 border-dashed rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-100 rounded-full">
                          <ArrowUpRight className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3>Withdraw Money</h3>
                          <p className="text-sm text-gray-600">Remove funds from account</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="withdrawAmount">Amount</Label>
                          <Input
                            id="withdrawAmount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        {selectedAccountData && (
                          <p className="text-sm text-gray-600">
                            Available: ${selectedAccountData.balance.toFixed(2)}
                          </p>
                        )}
                        <Button type="submit" className="w-full" disabled={!selectedAccount}>
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          Process Withdrawal
                        </Button>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="transfer">
                  <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="p-6 border-2 border-dashed rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <ArrowLeftRight className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3>Transfer Money</h3>
                          <p className="text-sm text-gray-600">Transfer between accounts</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="transferTo">Transfer To</Label>
                          <Select value={transferTo} onValueChange={setTransferTo}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select recipient account" />
                            </SelectTrigger>
                            <SelectContent>
                              {approvedAccounts
                                .filter(acc => acc.id !== selectedAccount)
                                .map(acc => (
                                  <SelectItem key={acc.id} value={acc.id}>
                                    {acc.customerName} - {acc.id}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="transferAmount">Amount</Label>
                          <Input
                            id="transferAmount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        {selectedAccountData && (
                          <p className="text-sm text-gray-600">
                            Available: ${selectedAccountData.balance.toFixed(2)}
                          </p>
                        )}
                        <Button type="submit" className="w-full" disabled={!selectedAccount || !transferTo}>
                          <ArrowLeftRight className="w-4 h-4 mr-2" />
                          Process Transfer
                        </Button>
                      </div>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
