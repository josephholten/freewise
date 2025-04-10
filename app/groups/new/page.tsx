'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGroup } from '@/app/actions/groups';
import Link from 'next/link';

export default function NewGroupPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await createGroup(formData.name, formData.description);
      
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/user');
      }
    } catch (err) {
      setError('Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Group</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/user"
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 