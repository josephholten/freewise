import { JWTPayload } from "jose";

interface SessionPayload extends JWTPayload {
    id: string;
}

export type { SessionPayload };