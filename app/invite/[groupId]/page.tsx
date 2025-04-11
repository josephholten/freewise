import { joinGroup } from '@/app/actions/group';
import { redirect } from 'next/navigation';
import { use, useEffect, useState } from 'react';

type PageParams = { groupId: string };

export default function InvitePage(params: Promise<PageParams>) {
  const rParams = use(params);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    joinGroup(rParams.groupId).then(result => {
      if (result.error) {
        // If they're already a member, just redirect them to the group
        if (result.error === 'You are already a member of this group') {
          redirect(`/group/${rParams.groupId}`);
        } else {
          setError(result.error);
        }
      }
    });
  }, [rParams.groupId]);

  // Otherwise show the error
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );
} 