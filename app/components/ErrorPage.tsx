import { BackToDashboard } from "@/app/components/BackToDashboard";

export function ErrorPage({ error, children }: { error: string, children?: React.ReactNode }) {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <BackToDashboard />
            {children}
          </div>
        </main>
    </div>
  );
}
