"use client"

import { joinGroup } from '@/app/actions/group';
import { redirect } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { ErrorPage } from '@/app/components/ErrorPage';
type PageParams = { groupId: string };

export default function InvitePage({params}: {params: Promise<PageParams>}) {
  const rParams = use(params);
  const [error, setError] = useState<string>('');

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

  return (
    <ErrorPage error={error} />
  );
} 