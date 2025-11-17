import { Card, CardContent } from './ui/card';
import { TrendingUp } from 'lucide-react';

interface AccountBalanceProps {
  balance: number;
}

export function AccountBalance({ balance }: AccountBalanceProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-blue-100">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-white">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <div className="flex items-center gap-1 text-green-300">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">2.5%</span>
            </div>
          </div>
          <p className="text-sm text-blue-100">Account #: ****1234</p>
        </div>
      </CardContent>
    </Card>
  );
}
