import { useState } from 'react';
import { Expense } from '@/prisma/generated/client';
import { EditExpenseDialog } from './EditExpenseDialog';

interface ExpenseWithPaidBy extends Expense {
  paidBy: {
    username: string;
  };
}

interface ExpensesTableProps {
  expenses: ExpenseWithPaidBy[];
  groupId: string;
  onUpdate: () => void;
}

export function ExpensesTable({ expenses, groupId, onUpdate }: ExpensesTableProps) {
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithPaidBy | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (expenses.length === 0) {
    return <p className="text-gray-500 text-center py-8">No expenses yet</p>;
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Paid By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr 
                key={expense.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedExpense(expense);
                  setIsEditDialogOpen(true);
                }}
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {expense.description}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-mono">
                  {expense.amount.toFixed(2)} {expense.currency}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {expense.paidBy.username}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditExpenseDialog
        groupId={groupId}
        expense={selectedExpense}
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setSelectedExpense(null);
        }}
        onExpenseEdited={() => {
          // Refresh the parent component
          onUpdate();
        }}
      />
    </>
  );
} 