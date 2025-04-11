import { JWTPayload } from "jose";

interface SessionPayload extends JWTPayload {
    id: string;
    role: string;
}

export type { SessionPayload };