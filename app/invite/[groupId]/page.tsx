import { joinGroup } from '@/app/actions/group';
import { redirect } from 'next/navigation';

export default async function InvitePage({ params }: { params: { groupId: string } }) {
  const result = await joinGroup(params.groupId);
  
  if (result.error) {
    // If they're already a member, just redirect them to the group
    if (result.error === 'You are already a member of this group') {
      redirect(`/group/${params.groupId}`);
    }
    
    // Otherwise show the error
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  // On success, redirect to the group page
  redirect(`/group/${params.groupId}`);
} 