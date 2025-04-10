import { JWTPayload } from "jose";

export interface SessionPayload extends JWTPayload {
  id: string;
  username: string;
}

export interface UserData {
  id: string;
  username: string;
}