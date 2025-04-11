"use client"

import { use, useEffect, useState } from 'react';
import { Group, GroupMember, Expense } from '@/prisma/generated/client';
import { Button } from '@/app/components/ui/button';
import { getGroup, leaveGroup } from '@/app/actions/group';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { EditExpenseDialog } from '@/app/components/EditExpenseDialog';
import { ExpensesTable } from '@/app/components/ExpensesTable';
import { LoadingPage } from '@/app/components/LoadingPage';
import { ErrorPage } from '@/app/components/ErrorPage';
import { BackToDashboard } from '@/app/components/BackToDashboard';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

type GroupWithMembers = Group & {
  members: (GroupMember & {
    user: {
      id: string;
      username: string;
    };
  })[];
  expenses: (Expense & {
    paidBy: {
      username: string;
    };
  })[];
};

type PageParams = { groupId: string };

export default function GroupPage({params}: {params: Promise<PageParams>}) {
  const rParams = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const fetchGroup = async (groupid: string, router: AppRouterInstance) => {
    const res = await getGroup(groupid);
    if (!res.isAuth) {
      router.push('/login');
    } else if (res.error) {
      setError(res.error);
    } else if (res.group) {
      setGroup(res.group);
    } else {
      setError("Failed to fetch group");
    }
  };

  useEffect(() => {
    fetchGroup(rParams.groupId, router);
  }, [rParams.groupId, router]);

  const copyInviteLink = () => {
    console.log("copying invite link");
    const inviteLink = `${window.location.origin}/invite/${rParams.groupId}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard!');
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) {
      return;
    }

    setIsLeaving(true);
    try {
      const result = await leaveGroup(rParams.groupId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Successfully left the group');
        router.push('/user');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to leave group');
    } finally {
      setIsLeaving(false);
    }
  };

  if (error) {
    return <ErrorPage error={error} />
  }

  if (!group) {
    return <LoadingPage />
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <BackToDashboard />
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="text-gray-600 mt-2">{group.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={copyInviteLink}>
                Share Invite Link
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLeaveGroup}
                disabled={isLeaving}
              >
                {isLeaving ? 'Leaving...' : 'Leave Group'}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-gray-600">
              {group.members.map((member, index) => (
                <span key={member.id}>
                  {member.user.username}
                  {index < group.members.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Expenses</h2>
            <Button onClick={() => setIsAddingExpense(true)}>Add Expense</Button>
          </div>
          
          <ExpensesTable 
            expenses={group.expenses}
            groupId={rParams.groupId}
            onUpdate={() => fetchGroup(rParams.groupId, router)}
          />
        </div>

        <EditExpenseDialog
          groupId={rParams.groupId}
          isOpen={isAddingExpense}
          onOpenChange={setIsAddingExpense}
          onExpenseEdited={() => fetchGroup(rParams.groupId, router)}
        />
      </main>
    </div>
  );
} 