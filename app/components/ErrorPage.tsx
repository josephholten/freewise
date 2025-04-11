import Link from "next/link";
import { Button } from "./ui/button";

export function ErrorPage({ error }: { error: string }) {
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
