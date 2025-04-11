import Link from "next/link";
import { Button } from "./ui/button";

export function BackToDashboard() {
  return (
    <Link href="/user">
      <Button variant="ghost" className="mb-4">
        ← Back to Dashboard
      </Button>
    </Link>
  );
}
