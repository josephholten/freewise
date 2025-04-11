"use client"

import { useEffect, useState } from 'react';
import { getUserWithGroups, UserWithGroups } from '@/app/actions/user';
import { Button } from '@/app/components/ui/button';
import { logout } from '@/app/actions/auth';
import { CreateGroupDialog } from '@/app/components/CreateGroupDialog';
import { GroupsList } from '@/app/components/GroupsList';
import { useRouter } from 'next/navigation';
import { ErrorPage } from '../components/ErrorPage';
import { LoadingPage } from '../components/LoadingPage';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export default function UserPage() {
  const [user, setUser] = useState<UserWithGroups | null>(null);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (router: AppRouterInstance) => {
    const res = await getUserWithGroups();
    console.log("fetchUser response", res);
    if (!res.isAuth) {
      router.push('/login');
    } else if (res.error) {
      setError(res.error);
    } else if (res.user) {
      setUser(res.user);
    }
  }

  useEffect(() => {
    fetchUser(router);
  }, [router]);

  if (error) {
    return <ErrorPage error={error} />
  }

  if (!user) {
    return <LoadingPage />
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Hello, {user.username}!</h1>
          <Button
            onClick={() => logout().then(() => router.push('/login'))}
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
        onGroupCreated={() => fetchUser(router)}
      />
    </div>
  );
} 