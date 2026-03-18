import { normalizeEmail } from "./roles";

export const DEMO_LOGIN_MODES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type DemoLoginMode = (typeof DEMO_LOGIN_MODES)[keyof typeof DEMO_LOGIN_MODES];

type DemoAccount = {
  email: string;
  name: string;
  role: DemoLoginMode;
};

function readEnvString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function readEnvBoolean(value?: string | null) {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return ["1", "true", "yes", "on"].includes(normalized);
}

export function parseDemoLoginMode(value: unknown): DemoLoginMode | null {
  if (value === DEMO_LOGIN_MODES.USER || value === DEMO_LOGIN_MODES.ADMIN) {
    return value;
  }

  return null;
}

export function isDemoAuthEnabled(source: NodeJS.ProcessEnv = process.env) {
  const configuredValue = readEnvBoolean(source.AUTH_DEMO_ENABLED);

  if (configuredValue !== null) {
    return configuredValue;
  }

  return source.NODE_ENV !== "production";
}

export function isGoogleAuthEnabled(source: NodeJS.ProcessEnv = process.env) {
  return Boolean(readEnvString(source.AUTH_GOOGLE_ID) && readEnvString(source.AUTH_GOOGLE_SECRET));
}

export function getDemoAccounts(source: NodeJS.ProcessEnv = process.env): Record<DemoLoginMode, DemoAccount> {
  const userEmail = normalizeEmail(source.AUTH_DEMO_USER_EMAIL) ?? "demo-user@example.com";
  const adminEmail = normalizeEmail(source.AUTH_DEMO_ADMIN_EMAIL) ?? "demo-admin@example.com";

  return {
    USER: {
      email: userEmail,
      name: readEnvString(source.AUTH_DEMO_USER_NAME) ?? "Demo Buyer",
      role: DEMO_LOGIN_MODES.USER,
    },
    ADMIN: {
      email: adminEmail,
      name: readEnvString(source.AUTH_DEMO_ADMIN_NAME) ?? "Demo Admin",
      role: DEMO_LOGIN_MODES.ADMIN,
    },
  };
}

export function getDemoAccount(mode: DemoLoginMode, source: NodeJS.ProcessEnv = process.env): DemoAccount {
  return getDemoAccounts(source)[mode];
}
