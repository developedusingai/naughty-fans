import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET - Fetch user notifications
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fanEmail = searchParams.get('fanEmail');

        if (!fanEmail) {
            return NextResponse.json({ error: 'Fan email is required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const notifications = db.collection('notifications');

        const userNotifications = await notifications
            .find({ recipientEmail: fanEmail })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json({ notifications: userNotifications }, { status: 200 });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Mark notification as read
export async function PATCH(request) {
    try {
        const { notificationId } = await request.json();

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const notifications = db.collection('notifications');

        await notifications.updateOne(
            { _id: new ObjectId(notificationId) },
            { $set: { isRead: true } }
        );

        return NextResponse.json({ message: 'Marked as read' }, { status: 200 });
    } catch (error) {
        console.error('Update notification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
