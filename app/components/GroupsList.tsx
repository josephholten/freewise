import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Group } from '@prisma/client';

interface GroupWithMember {
  group: Group;
}

interface GroupsListProps {
  groups: GroupWithMember[];
  onCreateGroup: () => void;
}

export function GroupsList({ groups, onCreateGroup }: GroupsListProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Groups</h2>
        <Button onClick={onCreateGroup}>
          Create New Group
        </Button>
      </div>
    
      {groups.length === 0 ? (
        <p className="text-gray-500">{"You haven't joined any groups yet."}</p>
      ) : (
        <div className="space-y-4">
          {groups.map(({ group }) => (
            <Link 
              href={`/group/${group.id}`} 
              key={group.id} 
              className="block border-b pb-4 hover:bg-gray-50 transition-colors rounded-lg p-4 -mx-4"
            >
              <h3 className="font-medium text-lg text-primary">{group.name}</h3>
              {group.description && (
                <p className="text-gray-600 mt-1">{group.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 