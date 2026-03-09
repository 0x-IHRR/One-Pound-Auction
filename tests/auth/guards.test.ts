import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUserMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
}));

vi.mock("@/app/lib/auth/session", () => ({
  getCurrentUser: getCurrentUserMock,
}));

import { requireAdmin, requireUser } from "@/app/lib/auth/guards";

describe("auth guard helpers", () => {
  beforeEach(() => {
    getCurrentUserMock.mockReset();
  });

  it("rejects unauthenticated access", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    await expect(requireUser()).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
      name: "AuthGuardError",
    });
  });

  it("allows authenticated users through requireUser", async () => {
    const currentUser = {
      email: "member@example.com",
      role: "USER",
    };

    getCurrentUserMock.mockResolvedValue(currentUser);

    await expect(requireUser()).resolves.toEqual(currentUser);
  });

  it("blocks non-admin users from requireAdmin", async () => {
    getCurrentUserMock.mockResolvedValue({
      email: "member@example.com",
      role: "USER",
    });

    await expect(requireAdmin()).rejects.toMatchObject({
      code: "FORBIDDEN",
      name: "AuthGuardError",
    });
  });

  it("allows admins through requireAdmin", async () => {
    const currentUser = {
      email: "admin@example.com",
      role: "ADMIN",
    };

    getCurrentUserMock.mockResolvedValue(currentUser);

    await expect(requireAdmin()).resolves.toEqual(currentUser);
  });
});
