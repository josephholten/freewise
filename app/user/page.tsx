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
import { createGroup } from '@/app/actions/group';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { useRouter } from 'next/navigation';

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserWithGroups | null>(null);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const fetchUser = async () => setUser(await getUserWithGroups());
    fetchUser();
  }, [])

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const result = await createGroup(formData.name, formData.description);
      if (result.error) {
        setError(result.error);
      } else {
        setIsCreateGroupDialogOpen(false);
        setFormData({ name: '', description: '' });
        // Refresh the user data to show the new group
        setUser(await getUserWithGroups());
      }
    } catch (err) {
      setError('Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

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
              Create a new group to start sharing expenses with friends.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGroup}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  placeholder="Enter group name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter group description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="resize-none"
                  rows={3}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateGroupDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 