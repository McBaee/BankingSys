import { useState } from 'react';
import { useBank } from '../contexts/BankContext';
import { Header } from './Header';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { CheckCircle, XCircle, Clock, Users, DollarSign, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { accounts, loans, transactions, approveAccount, rejectAccount, approveLoan, rejectLoan, currentUser } = useBank();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingAccounts = accounts.filter(acc => acc.status === 'pending');
  const approvedAccounts = accounts.filter(acc => acc.status === 'approved');
  const rejectedAccounts = accounts.filter(acc => acc.status === 'rejected');

  const pendingLoans = loans.filter(loan => loan.status === 'pending');
  const approvedLoans = loans.filter(loan => loan.status === 'approved');
  const rejectedLoans = loans.filter(loan => loan.status === 'rejected');

  const handleApproveAccount = (accountId: string) => {
    if (currentUser) {
      approveAccount(accountId, currentUser.id);
      toast.success('Account approved successfully');
      setSelectedAccount(null);
    }
  };

  const handleRejectAccount = (accountId: string) => {
    if (currentUser && rejectionReason.trim()) {
      rejectAccount(accountId, currentUser.id, rejectionReason);
      toast.success('Account rejected');
      setSelectedAccount(null);
      setRejectionReason('');
    } else {
      toast.error('Please provide a rejection reason');
    }
  };

  const handleApproveLoan = (loanId: string) => {
    if (currentUser) {
      approveLoan(loanId, currentUser.id);
      toast.success('Loan approved and disbursed');
      setSelectedLoan(null);
    }
  };

  const handleRejectLoan = (loanId: string) => {
    if (currentUser && rejectionReason.trim()) {
      rejectLoan(loanId, currentUser.id, rejectionReason);
      toast.success('Loan rejected');
      setSelectedLoan(null);
      setRejectionReason('');
    } else {
      toast.error('Please provide a rejection reason');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2>Admin Dashboard</h2>
          <p className="text-gray-600">Manage accounts, loans, and oversee operations</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Accounts</p>
                  <h3>{accounts.length}</h3>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Accounts</p>
                  <h3>{pendingAccounts.length}</h3>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Loans</p>
                  <h3>{loans.length}</h3>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <h3>{transactions.length}</h3>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="accounts">Account Management</TabsTrigger>
            <TabsTrigger value="loans">Loan Management</TabsTrigger>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Accounts ({pendingAccounts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingAccounts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending accounts</p>
                ) : (
                  <div className="space-y-3">
                    {pendingAccounts.map(account => (
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p>{account.customerName}</p>
                          <p className="text-sm text-gray-600">ID: {account.id}</p>
                          <p className="text-sm text-gray-600">{account.idType}: {account.idNumber}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApproveAccount(account.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setSelectedAccount(account.id)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Approved Accounts ({approvedAccounts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {approvedAccounts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No approved accounts</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {approvedAccounts.map(account => (
                        <div key={account.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p>{account.customerName}</p>
                              <p className="text-sm text-gray-600">{account.id}</p>
                            </div>
                            <Badge variant="default">Approved</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rejected Accounts ({rejectedAccounts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {rejectedAccounts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No rejected accounts</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {rejectedAccounts.map(account => (
                        <div key={account.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p>{account.customerName}</p>
                              <p className="text-sm text-gray-600">{account.id}</p>
                              <p className="text-sm text-red-600">{account.rejectionReason}</p>
                            </div>
                            <Badge variant="destructive">Rejected</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Loans ({pendingLoans.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLoans.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending loans</p>
                ) : (
                  <div className="space-y-3">
                    {pendingLoans.map(loan => (
                      <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p>{loan.customerName}</p>
                          <p className="text-sm text-gray-600">Loan ID: {loan.id}</p>
                          <p className="text-sm text-gray-600">
                            Amount: ${loan.amount.toLocaleString()} | Interest: {loan.interestRate}% | Term: {loan.termYears} years
                          </p>
                          <p className="text-sm text-gray-600">
                            Monthly: ${loan.monthlyAmortization.toFixed(2)} | Total: ${loan.totalPayable.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApproveLoan(loan.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setSelectedLoan(loan.id)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Approved Loans ({approvedLoans.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {approvedLoans.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No approved loans</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {approvedLoans.map(loan => (
                        <div key={loan.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p>{loan.customerName}</p>
                              <p className="text-sm text-gray-600">{loan.id}</p>
                              <p className="text-sm text-gray-600">${loan.amount.toLocaleString()}</p>
                            </div>
                            <Badge variant="default">Approved</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rejected Loans ({rejectedLoans.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {rejectedLoans.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No rejected loans</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {rejectedLoans.map(loan => (
                        <div key={loan.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p>{loan.customerName}</p>
                              <p className="text-sm text-gray-600">{loan.id}</p>
                              <p className="text-sm text-red-600">{loan.rejectionReason}</p>
                            </div>
                            <Badge variant="destructive">Rejected</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions ({transactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No transactions</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactions.slice().reverse().map(txn => (
                      <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm">{txn.description}</p>
                          <p className="text-xs text-gray-600">
                            {txn.accountId} | {new Date(txn.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={txn.type.includes('in') || txn.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                            {txn.type.includes('in') || txn.type === 'deposit' ? '+' : '-'}${txn.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">Bal: ${txn.balanceAfter.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Rejection Dialog for Accounts */}
      <Dialog open={selectedAccount !== null} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Account</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                setSelectedAccount(null);
                setRejectionReason('');
              }}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => selectedAccount && handleRejectAccount(selectedAccount)}>
                Reject Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog for Loans */}
      <Dialog open={selectedLoan !== null} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Loan</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this loan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="loanReason">Rejection Reason</Label>
              <Textarea
                id="loanReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                setSelectedLoan(null);
                setRejectionReason('');
              }}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => selectedLoan && handleRejectLoan(selectedLoan)}>
                Reject Loan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
