import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
    try {
        const boxes = await prisma.auctionItem.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(boxes);
    } catch (error) {
        console.error('Failed to fetch boxes:', error);
        return NextResponse.json({ error: 'Failed to fetch boxes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const { title, hook_description, hidden_content, price, itemType, accepts_barter, barter_demand } = json;

        const newBox = await prisma.auctionItem.create({
            data: {
                title,
                hook_description,
                hidden_content,
                price: price || 1.0,
                itemType: itemType || 'OFFER',
                accepts_barter: accepts_barter || false,
                barter_demand: barter_demand || null,
            }
        });

        return NextResponse.json(newBox, { status: 201 });
    } catch (error) {
        console.error('Failed to create box:', error);
        return NextResponse.json({ error: 'Failed to create box' }, { status: 500 });
    }
}
