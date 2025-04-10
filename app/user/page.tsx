import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

const secretKey = process.env.JWT_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export default async function UserPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('freewise-jwt')?.value;
  if (!token) {
    redirect('/login');
  }
  try {
    const decoded = await jwtVerify(token, encodedKey);
    const username = decoded.payload.username;

    return (
        <div className="min-h-screen p-8">
        <main className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-700">Username: <span className="font-semibold">{username}</span></p>
            </div>
        </main>
        </div>
    );
  } catch (error) {
    console.error('Error decoding token:', error);
    redirect('/login');
  }

  
} 