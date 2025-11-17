import { useBank } from '../contexts/BankContext';
import { Header } from './Header';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Wallet, CreditCard, Receipt, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function CustomerDashboard() {
  const { currentUser, accounts, getTransactionsByAccountId, getLoansByAccountId } = useBank();

  const customerAccount = accounts.find(acc => acc.customerId === currentUser?.id);
  const transactions = customerAccount ? getTransactionsByAccountId(customerAccount.id) : [];
  const loans = customerAccount ? getLoansByAccountId(customerAccount.id) : [];

  if (!customerAccount) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Account Found</AlertTitle>
            <AlertDescription>
              Your account is being processed. Please contact the bank for more information.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (customerAccount.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Account Pending Approval</AlertTitle>
            <AlertDescription>
              Your account is currently under review by our admin team. You will be able to access your account once it's approved.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (customerAccount.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Account Rejected</AlertTitle>
            <AlertDescription>
              {customerAccount.rejectionReason || 'Your account application was rejected. Please contact the bank for more information.'}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2>Welcome, {customerAccount.customerName}</h2>
          <p className="text-gray-600">View your account information (Read-Only)</p>
        </div>

        {/* Account Balance Card */}
        <Card className="mb-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Balance</p>
                <h2 className="text-white">${customerAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                <p className="text-sm text-blue-100 mt-2">Account #: {customerAccount.id}</p>
              </div>
              <Wallet className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <Badge variant="default" className="mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p>{transactions.length}</p>
                </div>
                <Receipt className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Loans</p>
                  <p>{loans.filter(l => l.status === 'approved').length}</p>
                </div>
                <CreditCard className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History ({transactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.map(txn => (
                      <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            txn.type.includes('in') || txn.type === 'deposit' || txn.type === 'loan_disbursement'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {txn.type.includes('in') || txn.type === 'deposit' || txn.type === 'loan_disbursement' ? '↓' : '↑'}
                          </div>
                          <div>
                            <p>{txn.description}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(txn.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={
                            txn.type.includes('in') || txn.type === 'deposit' || txn.type === 'loan_disbursement'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }>
                            {txn.type.includes('in') || txn.type === 'deposit' || txn.type === 'loan_disbursement' ? '+' : '-'}
                            ${txn.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Bal: ${txn.balanceAfter.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>Loan Information ({loans.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loans.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No loan applications</p>
                ) : (
                  <div className="space-y-4">
                    {loans.map(loan => (
                      <div key={loan.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p>{loan.id}</p>
                            <p className="text-sm text-gray-600">
                              Applied: {new Date(loan.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={
                            loan.status === 'approved' ? 'default' :
                            loan.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }>
                            {loan.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Loan Amount</p>
                            <p>${loan.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Interest Rate</p>
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
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Monthly Amortization</p>
                          <p>${loan.monthlyAmortization.toFixed(2)}</p>
                        </div>
                        {loan.status === 'rejected' && loan.rejectionReason && (
                          <p className="text-sm text-red-600 mt-2">
                            Rejection Reason: {loan.rejectionReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p>{customerAccount.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account ID</p>
                      <p>{customerAccount.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p>{customerAccount.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer ID</p>
                      <p>{customerAccount.customerId}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Address</p>
                      <p>{customerAccount.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID Type</p>
                      <p>{customerAccount.idType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID Number</p>
                      <p>{customerAccount.idNumber}</p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 h-4" />
                    <AlertTitle>Mobile Access</AlertTitle>
                    <AlertDescription>
                      This is a view-only mobile interface. To perform transactions (deposits, withdrawals, transfers), please visit the bank.
                    </AlertDescription>
                  </Alert>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Default Login Credentials</p>
                    <p className="text-sm">Username: {customerAccount.customerId}</p>
                    <p className="text-sm">Password: customer123</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
