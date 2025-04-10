import { redirect } from 'next/navigation';
import { verifySession } from '@/app/lib/session';
import { PrismaClient, Group } from '@/generated/prisma_client';
import Link from 'next/link';

const prisma = new PrismaClient();

type UserWithGroups = {
  username: string;
  groups: {
    group: Group;
  }[];
};

export default async function UserPage() {
  const { isAuth, id } = await verifySession();

  const user = await prisma.user.findUnique({
    where: { id },
    select: { 
      username: true,
      groups: {
        include: {
          group: true
        }
      }
    }
  }) as UserWithGroups | null;

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Profile</h1>
          <a 
            href="/logout"
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            Logout
          </a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="text-gray-700">Username: <span className="font-semibold">{user.username}</span></p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Groups</h2>
            <Link 
              href="/groups/new"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Create New Group
            </Link>
          </div>
          
          {user.groups.length === 0 ? (
            <p className="text-gray-500">You haven't joined any groups yet.</p>
          ) : (
            <div className="grid gap-4">
              {user.groups.map(({ group }) => (
                <div key={group.id} className="border p-4 rounded">
                  <h3 className="font-semibold">{group.name}</h3>
                  {group.description && (
                    <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 