import { afterEach, describe, expect, it } from "vitest";

import {
  DEMO_LOGIN_MODES,
  getDemoAccount,
  isDemoAuthEnabled,
  isGoogleAuthEnabled,
  parseDemoLoginMode,
} from "@/app/lib/auth/demo-auth";

const originalEnv = {
  AUTH_DEMO_ENABLED: process.env.AUTH_DEMO_ENABLED,
  AUTH_DEMO_USER_EMAIL: process.env.AUTH_DEMO_USER_EMAIL,
  AUTH_DEMO_ADMIN_EMAIL: process.env.AUTH_DEMO_ADMIN_EMAIL,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};

afterEach(() => {
  process.env.AUTH_DEMO_ENABLED = originalEnv.AUTH_DEMO_ENABLED;
  process.env.AUTH_DEMO_USER_EMAIL = originalEnv.AUTH_DEMO_USER_EMAIL;
  process.env.AUTH_DEMO_ADMIN_EMAIL = originalEnv.AUTH_DEMO_ADMIN_EMAIL;
  process.env.AUTH_GOOGLE_ID = originalEnv.AUTH_GOOGLE_ID;
  process.env.AUTH_GOOGLE_SECRET = originalEnv.AUTH_GOOGLE_SECRET;
  process.env.NODE_ENV = originalEnv.NODE_ENV;
});

describe("demo auth helpers", () => {
  it("parses only supported demo login modes", () => {
    expect(parseDemoLoginMode(DEMO_LOGIN_MODES.USER)).toBe("USER");
    expect(parseDemoLoginMode(DEMO_LOGIN_MODES.ADMIN)).toBe("ADMIN");
    expect(parseDemoLoginMode("OTHER")).toBeNull();
  });

  it("enables demo auth by default outside production", () => {
    process.env.AUTH_DEMO_ENABLED = "";
    process.env.NODE_ENV = "development";

    expect(isDemoAuthEnabled()).toBe(true);
  });

  it("supports explicitly disabling demo auth", () => {
    process.env.AUTH_DEMO_ENABLED = "false";

    expect(isDemoAuthEnabled()).toBe(false);
  });

  it("reads normalized demo accounts from env", () => {
    process.env.AUTH_DEMO_USER_EMAIL = " Demo-User@Example.com ";
    process.env.AUTH_DEMO_ADMIN_EMAIL = " Demo-Admin@Example.com ";

    expect(getDemoAccount("USER")).toMatchObject({
      email: "demo-user@example.com",
      role: "USER",
    });
    expect(getDemoAccount("ADMIN")).toMatchObject({
      email: "demo-admin@example.com",
      role: "ADMIN",
    });
  });

  it("only enables google auth when client id and secret are both present", () => {
    process.env.AUTH_GOOGLE_ID = "google-id";
    process.env.AUTH_GOOGLE_SECRET = "";
    expect(isGoogleAuthEnabled()).toBe(false);

    process.env.AUTH_GOOGLE_SECRET = "google-secret";
    expect(isGoogleAuthEnabled()).toBe(true);
  });
});
