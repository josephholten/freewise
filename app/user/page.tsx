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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Hello, {user.username}!</h1>
          <Button
            onClick={() => logout()}
            variant="outline"
          >
            Logout
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Groups</h2>
              <Button
                onClick={() => setIsCreateGroupDialogOpen(true)}
              >
                Create New Group
              </Button>
            </div>
          
          {user.groups.length === 0 ? (
            <p className="text-gray-500">You haven't joined any groups yet.</p>
          ) : (
            <div className="space-y-4">
              {user.groups.map(({ group }) => (
                <div key={group.id} className="border-b pb-4">
                  <h3 className="font-medium text-lg">{group.name}</h3>
                  {group.description && (
                    <p className="text-gray-600 mt-1">{group.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
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