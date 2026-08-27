import crypto from "crypto";

export interface LocalPairingSession {
  id: string;
  token: string;
  computerName: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  expirationMinutes: number;
  connectionType: string;
  pairedAt?: Date;
  clientIp?: string;
}

export interface LocalSignalingMessage {
  id: string;
  sessionId: string;
  sender: string;
  type: string;
  payload: unknown;
  createdAt: Date;
}

const globalStore = globalThis as typeof globalThis & {
  __mobileWebcamPairingStore?: {
    sessions: Map<string, LocalPairingSession>;
    messages: LocalSignalingMessage[];
  };
};

export const pairingStore = globalStore.__mobileWebcamPairingStore ?? {
  sessions: new Map<string, LocalPairingSession>(),
  messages: [] as LocalSignalingMessage[],
};

globalStore.__mobileWebcamPairingStore = pairingStore;

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}