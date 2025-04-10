"use client"

import { use, useEffect, useState } from 'react';
import { PrismaClient, Group, GroupMember, User } from '@/generated/prisma_client';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import { getGroup } from '@/app/actions/group';

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
          <h1 className="text-3xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-gray-600 mt-2">{group.description}</p>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            <div className="space-y-2">
              {group.members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{member.user.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 