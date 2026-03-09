import { NextResponse } from 'next/server';
import {
    applyCurrentUserCookies,
    clearCurrentUserCookies,
    parseDemoSessionInput,
} from '../../lib/current-user';

export async function POST(request: Request) {
    try {
        const parsed = parseDemoSessionInput(await request.json());

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: parsed.statusCode });
        }

        const response = NextResponse.json({
            email: parsed.data.email,
            name: parsed.data.name,
            role: parsed.data.role,
        });

        applyCurrentUserCookies(response, parsed.data);

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: '登录失败。' }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    clearCurrentUserCookies(response);
    return response;
}
