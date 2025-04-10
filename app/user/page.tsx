"use client"

import { useEffect, useState } from 'react';
import { getUserWithGroups, UserWithGroups } from '@/app/actions/user';
import { Button } from '@/app/components/ui/button';
import { logout } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { CreateGroupDialog } from '@/app/components/group/CreateGroupDialog';
import { GroupsList } from '@/app/components/group/GroupsList';

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserWithGroups | null>(null);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);

  const fetchUser = async () => setUser(await getUserWithGroups());

  useEffect(() => {
    fetchUser();
  }, []);

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
          <GroupsList
            groups={user.groups}
            onCreateGroup={() => setIsCreateGroupDialogOpen(true)}
          />
        </div>
      </main>

      <CreateGroupDialog
        isOpen={isCreateGroupDialogOpen}
        onOpenChange={setIsCreateGroupDialogOpen}
        onGroupCreated={fetchUser}
      />
    </div>
  );
} 