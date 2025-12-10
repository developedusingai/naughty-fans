import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Check subscription status between fan and creator
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fanEmail = searchParams.get('fanEmail');
        const creatorEmail = searchParams.get('creatorEmail');

        if (!fanEmail || !creatorEmail) {
            return NextResponse.json(
                { error: 'Fan email and creator email are required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const subscriptions = db.collection('subscriptions');

        // Check if subscription exists
        const subscription = await subscriptions.findOne({ fanEmail, creatorEmail });

        if (!subscription) {
            return NextResponse.json({ status: null }, { status: 200 });
        }

        return NextResponse.json({ status: subscription.status }, { status: 200 });
    } catch (error) {
        console.error('Check subscription status error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
