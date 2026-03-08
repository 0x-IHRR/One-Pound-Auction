import { afterEach, describe, expect, it } from "vitest";

import { hasRole, normalizeEmail, normalizeRole, resolveUserRole } from "@/app/lib/auth/roles";

const originalAdminEmails = process.env.AUTH_ADMIN_EMAILS;

afterEach(() => {
  process.env.AUTH_ADMIN_EMAILS = originalAdminEmails;
});

describe("auth roles", () => {
  it("normalizes emails before comparison", () => {
    expect(normalizeEmail("  Admin@Example.com ")).toBe("admin@example.com");
    expect(normalizeEmail("   ")).toBeNull();
  });

  it("maps unknown role values back to USER", () => {
    expect(normalizeRole("ADMIN")).toBe("ADMIN");
    expect(normalizeRole("something-else")).toBe("USER");
  });

  it("resolves ADMIN from the configured email whitelist", () => {
    process.env.AUTH_ADMIN_EMAILS = "admin@example.com,ops@example.com";

    expect(resolveUserRole(" admin@example.com ")).toBe("ADMIN");
    expect(resolveUserRole("user@example.com")).toBe("USER");
    expect(resolveUserRole(null)).toBe("USER");
  });

  it("compares role priority correctly", () => {
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
    expect(hasRole("ADMIN", "USER")).toBe(true);
    expect(hasRole("USER", "ADMIN")).toBe(false);
    expect(hasRole(null, "USER")).toBe(false);
  });
});
