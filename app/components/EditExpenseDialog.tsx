import { useEffect, useState } from 'react';
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
import { Expense } from '@/generated/prisma_client';
import { createExpense, updateExpense } from '@/app/actions/expense';

interface EditExpenseDialogProps {
  groupId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseEdited: () => void;
  expense?: Expense | null; // Optional expense for editing mode
}

export function EditExpenseDialog({ 
  groupId, 
  isOpen, 
  onOpenChange, 
  onExpenseEdited,
  expense 
}: EditExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'EUR'
  });

  // Reset form when dialog opens/closes or expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        currency: expense.currency
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        currency: 'EUR'
      });
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        toast.error('Please enter a valid amount');
        return;
      }

      let result;
      if (expense) {
        // Update existing expense
        result = await updateExpense(expense.id, {
          description: formData.description,
          amount,
          currency: formData.currency
        });
      } else {
        // Create new expense
        result = await createExpense({
          groupId,
          description: formData.description,
          amount,
          currency: formData.currency
        });
      }

      if ('error' in result) {
        setError(result.error || 'An unknown error occurred');
        toast.error(result.error || 'An unknown error occurred');
      } else {
        toast.success(expense ? 'Expense updated successfully' : 'Expense added successfully');
        onOpenChange(false);
        onExpenseEdited();
      }
    } catch (err) {
      setError('Failed to save expense. Please try again.');
      toast.error('Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          <DialogDescription>
            {expense 
              ? 'Update the expense details.'
              : 'Add a new expense to the group. The amount will be split equally among all members.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What was this expense for?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  required
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
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
              {isSubmitting 
                ? (expense ? 'Updating...' : 'Adding...') 
                : (expense ? 'Update Expense' : 'Add Expense')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 