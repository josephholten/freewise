import { verifySession } from '@/app/lib/dal';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function UserPage() {
  const { isAuth, id } = await verifySession();

  const user = await prisma.user.findUnique({
    where: { id },
    select: { username: true }
  });

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-700">Username: <span className="font-semibold">{user?.username}</span></p>
        </div>
      </main>
    </div>
  );
} 