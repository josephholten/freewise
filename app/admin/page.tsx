'use client';

import { useEffect, useState } from 'react';
import { getAllUsers } from '@/app/actions/user';
import { getAllGroups, getAllGroupMemberships } from '@/app/actions/group';
import { getAllExpenses, getAllExpenseShares } from '@/app/actions/expense';
import { User, Group } from '@prisma/client';
import { ErrorPage } from '@/app/components/ErrorPage';
import { Button } from '@/app/components/ui/button';
import { logout } from '../actions/auth';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes, membershipsRes, expensesRes, sharesRes] = await Promise.all([
          getAllUsers(),
          getAllGroups(),
          getAllGroupMemberships(),
          getAllExpenses(),
          getAllExpenseShares(),
        ]);

        if (!usersRes.success) throw new Error(usersRes.error || 'Failed to fetch users');
        if (!groupsRes.success) throw new Error(groupsRes.error || 'Failed to fetch groups');
        if (!membershipsRes.success) throw new Error(membershipsRes.error || 'Failed to fetch memberships');
        if (!expensesRes.success) throw new Error(expensesRes.error || 'Failed to fetch expenses');
        if (!sharesRes.success) throw new Error(sharesRes.error || 'Failed to fetch shares');

        setUsers(usersRes.users || []);
        setGroups(groupsRes.groups || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <ErrorPage error={error}>
        <Button variant="link" onClick={() =>logout().then(()=>router.push("/login")) }>
          Logout
        </Button>
      </ErrorPage>
    );
  }

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Users Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Username</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Default Currency</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 border">{user.username}</td>
                  <td className="px-4 py-2 border">{user.role}</td>
                  <td className="px-4 py-2 border">{user.defaultCurrency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Groups Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Groups</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Members</th>
                <th className="px-4 py-2 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
                  <td className="px-4 py-2 border">{group.name}</td>
                  <td className="px-4 py-2 border">{group.description || '-'}</td>
                  <td className="px-4 py-2 border">{new Date(group.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
} 