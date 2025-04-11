import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { createExpense } from '@/app/actions/expense';

interface AddExpenseDialogProps {
  groupId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded: () => void;
}

export function AddExpenseDialog({ groupId, isOpen, onOpenChange, onExpenseAdded }: AddExpenseDialogProps) {
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    currency: 'EUR'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const amount = parseFloat(expenseForm.amount);
      if (isNaN(amount)) {
        toast.error('Please enter a valid amount');
        return;
      }

      const result = await createExpense({
        groupId,
        description: expenseForm.description,
        amount,
        currency: expenseForm.currency
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Expense added successfully');
        onOpenChange(false);
        setExpenseForm({ description: '', amount: '', currency: 'EUR' });
        onExpenseAdded();
      }
    } catch (error) {
      toast.error('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Add a new expense to the group. The amount will be split equally among all members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddExpense}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What was this expense for?"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={expenseForm.currency}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, currency: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 