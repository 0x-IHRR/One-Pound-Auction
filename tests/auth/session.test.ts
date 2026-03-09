import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

import { getCurrentSession, getCurrentUser, isAuthenticated } from "@/app/lib/auth/session";

describe("auth session helpers", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("normalizes the session role when a session exists", async () => {
    authMock.mockResolvedValue({
      user: {
        email: "member@example.com",
        role: "ADMIN",
      },
    });

    await expect(getCurrentSession()).resolves.toMatchObject({
      user: {
        email: "member@example.com",
        role: "ADMIN",
      },
    });
  });

  it("returns null current user when the session has no usable email", async () => {
    authMock.mockResolvedValue({
      user: {
        email: "   ",
        role: "USER",
      },
    });

    await expect(getCurrentUser()).resolves.toBeNull();
    await expect(isAuthenticated()).resolves.toBe(false);
  });

  it("returns a normalized current user for authenticated sessions", async () => {
    authMock.mockResolvedValue({
      user: {
        email: "  admin@example.com  ",
        image: "avatar.png",
        name: "Admin",
        role: "SOMETHING_UNEXPECTED",
      },
    });

    await expect(getCurrentUser()).resolves.toEqual({
      email: "admin@example.com",
      image: "avatar.png",
      name: "Admin",
      role: "USER",
    });
    await expect(isAuthenticated()).resolves.toBe(true);
  });
});
