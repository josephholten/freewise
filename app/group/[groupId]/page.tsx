"use client"

import { use, useEffect, useState } from 'react';
import { PrismaClient, Group, GroupMember, User } from '@/generated/prisma_client';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import { getGroup } from '@/app/actions/group';
import { toast } from 'sonner';

const prisma = new PrismaClient();

type GroupWithMembers = Group & {
  members: (GroupMember & {
    user: User;
  })[];
};

type PageParams = { groupId: string };

export default function GroupPage({params}: {params: Promise<PageParams>}) {
  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rParams = use(params);

  const copyInviteLink = () => {
    console.log("copying invite link");
    const inviteLink = `${window.location.origin}/invite/${rParams.groupId}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard!');
  };

  useEffect(() => {
    const fetchGroup = async () => {
      const group = await getGroup(rParams.groupId);
      if (group.error) {
        setError(group.error);
      } else if (group.group) {
        setGroup(group.group);
      } else {
        setError("Failed to fetch group");
      }
    };

    fetchGroup();
  }, [rParams.groupId]);

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <main className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Link href="/user">
              <Button variant="link" className="mt-4">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen p-8">
        <main className="max-w-4xl mx-auto">
          <div className="text-center">
            Loading...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/user">
            <Button variant="ghost" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="text-gray-600 mt-2">{group.description}</p>
              )}
            </div>
            <Button onClick={copyInviteLink}>
              Share Invite Link
            </Button>
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
      </main>
    </div>
  );
} 