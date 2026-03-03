import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Await the entire params object in Next.js 15
) {
    try {
        const { id } = await params;
        // Increment sales count
        const updatedBox = await prisma.auctionItem.update({
            where: { id: id },
            data: {
                sales_count: {
                    increment: 1
                }
            }
        });

        // Return the secret content ONLY upon successful "purchase"
        return NextResponse.json({
            success: true,
            hidden_content: updatedBox.hidden_content
        });
    } catch (error) {
        console.error('Failed to process purchase:', error);
        return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 });
    }
}
