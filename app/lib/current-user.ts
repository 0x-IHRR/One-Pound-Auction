import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type DemoUserRole = 'USER' | 'ADMIN';

export interface CurrentUser {
    email: string;
    name: string;
    role: DemoUserRole;
}

export interface DemoSessionInput {
    email: string;
    name: string;
    role: DemoUserRole;
}

type ParseSuccess<T> = { success: true; data: T };
type ParseFailure = { success: false; error: string; statusCode: number };

export const demoSessionCookies = {
    email: 'marketplace-demo-email',
    name: 'marketplace-demo-name',
    role: 'marketplace-demo-role',
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown) {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function parseRole(value: unknown): DemoUserRole {
    return value === 'ADMIN' ? 'ADMIN' : 'USER';
}

function parseCookieValue(cookieHeader: string | null, key: string) {
    if (!cookieHeader) {
        return null;
    }

    const match = cookieHeader
        .split(';')
        .map((chunk) => chunk.trim())
        .find((chunk) => chunk.startsWith(`${key}=`));

    if (!match) {
        return null;
    }

    const [, rawValue = ''] = match.split('=');

    try {
        return decodeURIComponent(rawValue);
    } catch {
        return rawValue;
    }
}

export function parseDemoSessionInput(payload: unknown): ParseSuccess<DemoSessionInput> | ParseFailure {
    if (!payload || typeof payload !== 'object') {
        return { success: false, error: '请求体格式不正确。', statusCode: 400 };
    }

    const record = payload as Record<string, unknown>;
    const email = cleanText(record.email).toLowerCase();
    const name = cleanText(record.name);

    if (!emailPattern.test(email)) {
        return { success: false, error: '请输入有效的邮箱地址。', statusCode: 400 };
    }

    if (!name || name.length > 40) {
        return { success: false, error: '请输入 1 到 40 个字符的昵称。', statusCode: 400 };
    }

    return {
        success: true,
        data: {
            email,
            name,
            role: parseRole(record.role),
        },
    };
}

export function parseCurrentUser(value: {
    email?: unknown;
    name?: unknown;
    role?: unknown;
}): CurrentUser | null {
    const email = cleanText(value.email).toLowerCase();
    const name = cleanText(value.name);

    if (!emailPattern.test(email) || !name) {
        return null;
    }

    return {
        email,
        name,
        role: parseRole(value.role),
    };
}

export async function getCurrentUser() {
    const cookieStore = await cookies();

    return parseCurrentUser({
        email: cookieStore.get(demoSessionCookies.email)?.value,
        name: cookieStore.get(demoSessionCookies.name)?.value,
        role: cookieStore.get(demoSessionCookies.role)?.value,
    });
}

export async function getCurrentUserFromRequest(request: Request) {
    return parseCurrentUser({
        email:
            request.headers.get('x-demo-user-email') ??
            parseCookieValue(request.headers.get('cookie'), demoSessionCookies.email),
        name:
            request.headers.get('x-demo-user-name') ??
            parseCookieValue(request.headers.get('cookie'), demoSessionCookies.name),
        role:
            request.headers.get('x-demo-user-role') ??
            parseCookieValue(request.headers.get('cookie'), demoSessionCookies.role),
    });
}

export function applyCurrentUserCookies(response: NextResponse, user: CurrentUser) {
    response.cookies.set(demoSessionCookies.email, user.email, {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
    });
    response.cookies.set(demoSessionCookies.name, user.name, {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
    });
    response.cookies.set(demoSessionCookies.role, user.role, {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
    });
}

export function clearCurrentUserCookies(response: NextResponse) {
    response.cookies.delete(demoSessionCookies.email);
    response.cookies.delete(demoSessionCookies.name);
    response.cookies.delete(demoSessionCookies.role);
}
