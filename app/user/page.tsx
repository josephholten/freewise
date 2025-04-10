"use client"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/app/components/ui/dialog';
import { getUserWithGroups, UserWithGroups } from '@/app/actions/user';
import { Button } from '@/app/components/ui/button';
import { logout } from '@/app/actions/auth';

export default function UserPage() {

  const [user, setUser] = useState<UserWithGroups | null>(null);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => setUser(await getUserWithGroups());
    fetchUser();
  }, [])

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Profile</h1>
          <Button
            onClick={() => logout()}
          >
            Logout
          </Button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="text-gray-700">Username: <span className="font-semibold">{user.username}</span></p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Groups</h2>
            <Button
              onClick={() => setIsCreateGroupDialogOpen(true)}
            >
              Create New Group
            </Button>
          </div>
          
          {user.groups.length === 0 ? (
            <p className="text-gray-500">You haven't joined any groups yet.</p>
          ) : (
            <div className="grid gap-4">
              {user.groups.map(({ group }) => (
                <div key={group.id} className="border p-4 rounded">
                  <h3 className="font-semibold">{group.name}</h3>
                  {group.description && (
                    <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                      This is a description
                  </DialogDescription>
              </DialogHeader>
              <p>
                  This is a paragraph
              </p>
              <DialogFooter>
                  This is the footer
              </DialogFooter>
          </DialogContent>
      </Dialog>

    </div>

  );
} 