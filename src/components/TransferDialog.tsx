import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer: (recipient: string, amount: number) => void;
  currentBalance: number;
}

export function TransferDialog({ open, onOpenChange, onTransfer, currentBalance }: TransferDialogProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transferAmount = parseFloat(amount);
    
    if (!recipient.trim()) {
      toast.error('Please enter a recipient');
      return;
    }
    
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (transferAmount > currentBalance) {
      toast.error('Insufficient funds');
      return;
    }
    
    onTransfer(recipient, transferAmount);
    toast.success(`Successfully transferred $${transferAmount.toFixed(2)} to ${recipient}`);
    
    // Reset form
    setRecipient('');
    setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Money</DialogTitle>
          <DialogDescription>
            Send money to another account instantly
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="Enter account holder name"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Available: ${currentBalance.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Transfer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
