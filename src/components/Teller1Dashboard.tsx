import { useState } from 'react';
import { useBank } from '../contexts/BankContext';
import { Header } from './Header';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';


export function Teller1Dashboard() {
  const { createAccount, accounts } = useBank();
  const [formData, setFormData] = useState({
    customerName: '',
    dateOfBirth: '',
    address: '',
    idType: '',
    idNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.dateOfBirth || !formData.address || !formData.idType || !formData.idNumber) {
      toast.error('Please fill all fields');
      return;
    }

    const customerId = `CUST${Date.now()}`;
    
    createAccount({
      customerId,
      ...formData,
    });

    toast.success('Account created and sent for admin approval');
    
    // Reset form
    setFormData({
      customerName: '',
      dateOfBirth: '',
      address: '',
      idType: '',
      idNumber: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2>Account Creation</h2>
          <p className="text-gray-600">Register new customers and perform KYC verification</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                New Account Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter complete address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idType">Valid ID Type</Label>
                  <Select value={formData.idType} onValueChange={(value) => setFormData({ ...formData, idType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="National ID">National ID</SelectItem>
                      <SelectItem value="Driver's License">Driver's License</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Voter's ID">Voter's ID</SelectItem>
                      <SelectItem value="SSS ID">SSS ID</SelectItem>
                      <SelectItem value="UMID">UMID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="Enter ID number"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Submit for Approval
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications ({accounts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {accounts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No accounts created yet</p>
                ) : (
                  accounts.slice().reverse().map(account => (
                    <div key={account.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p>{account.customerName}</p>
                          <p className="text-sm text-gray-600">{account.id}</p>
                        </div>
                        <Badge variant={
                          account.status === 'approved' ? 'default' :
                          account.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {account.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>DoB: {account.dateOfBirth}</p>
                        <p>{account.idType}: {account.idNumber}</p>
                        <p>{account.address}</p>
                        <p className="text-xs">Created: {new Date(account.createdAt).toLocaleString()}</p>
                      </div>
                      {account.status === 'rejected' && account.rejectionReason && (
                        <p className="text-sm text-red-600 mt-2">Reason: {account.rejectionReason}</p>
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
