import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Fetch subscriptions or requests
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fanEmail = searchParams.get('fanEmail');
        const creatorEmail = searchParams.get('creatorEmail');
        const type = searchParams.get('type'); // 'subscriptions' or 'requests'

        const client = await clientPromise;
        const db = client.db('privatefan');
        const subscriptions = db.collection('subscriptions');

        // Fetch subscription requests for a creator
        if (type === 'requests' && creatorEmail) {
            const requests = await subscriptions
                .find({ creatorEmail, status: 'pending' })
                .sort({ requestedAt: -1 })
                .toArray();

            // Get fan details for each request
            const users = db.collection('users');
            const requestsWithDetails = await Promise.all(
                requests.map(async (req) => {
                    const fan = await users.findOne(
                        { email: req.fanEmail },
                        { projection: { password: 0 } }
                    );
                    return { ...req, fanDetails: fan };
                })
            );

            return NextResponse.json({ requests: requestsWithDetails }, { status: 200 });
        }

        // Fetch approved subscribers for a creator
        if (type === 'subscribers' && creatorEmail) {
            const approvedSubs = await subscriptions
                .find({ creatorEmail, status: 'approved' })
                .sort({ approvedAt: -1 })
                .toArray();

            // Get fan details for each subscriber
            const users = db.collection('users');
            const subscribersWithDetails = await Promise.all(
                approvedSubs.map(async (sub) => {
                    const fan = await users.findOne(
                        { email: sub.fanEmail },
                        { projection: { password: 0 } }
                    );
                    return { ...sub, fanDetails: fan };
                })
            );

            return NextResponse.json({ subscribers: subscribersWithDetails }, { status: 200 });
        }

        // Fetch approved subscriptions for a fan
        if (fanEmail) {
            if (type === 'my_subscriptions') {
                const userSubscriptions = await subscriptions
                    .find({ fanEmail, status: 'approved' })
                    .toArray();

                const users = db.collection('users');
                const subscriptionsWithDetails = await Promise.all(
                    userSubscriptions.map(async (sub) => {
                        const creator = await users.findOne(
                            { email: sub.creatorEmail },
                            { projection: { password: 0 } }
                        );
                        return { ...sub, creatorDetails: creator };
                    })
                );

                return NextResponse.json({ subscriptions: subscriptionsWithDetails }, { status: 200 });
            }

            const userSubscriptions = await subscriptions
                .find({ fanEmail, status: 'approved' })
                .toArray();

            const subscribedCreators = userSubscriptions.map(sub => sub.creatorEmail);
            return NextResponse.json({ subscribedCreators }, { status: 200 });
        }

        // Fetch all subscriptions (Admin)
        if (type === 'all') {
            const allSubs = await subscriptions
                .find({})
                .sort({ requestedAt: -1, approvedAt: -1 })
                .toArray();

            return NextResponse.json({ subscriptions: allSubs }, { status: 200 });
        }

        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    } catch (error) {
        console.error('Fetch subscriptions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Send subscription request
export async function POST(request) {
    try {
        const { fanEmail, fanName, creatorEmail } = await request.json();

        if (!fanEmail || !creatorEmail) {
            return NextResponse.json(
                { error: 'Fan email and creator email are required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const subscriptions = db.collection('subscriptions');

        // Check if request or subscription already exists
        const existing = await subscriptions.findOne({ fanEmail, creatorEmail });
        if (existing) {
            if (existing.status === 'pending') {
                return NextResponse.json(
                    { error: 'Request already pending', status: 'pending' },
                    { status: 409 }
                );
            }
            if (existing.status === 'approved') {
                return NextResponse.json(
                    { error: 'Already subscribed', status: 'approved' },
                    { status: 409 }
                );
            }
        }

        // Create subscription request
        await subscriptions.insertOne({
            fanEmail,
            fanName,
            creatorEmail,
            status: 'pending',
            requestedAt: new Date(),
        });

        // Create notification for creator
        try {
            const notifications = db.collection('notifications');
            await notifications.insertOne({
                recipientEmail: creatorEmail,
                senderEmail: fanEmail,
                type: 'subscription_request',
                message: `${fanName || fanEmail} requested to subscribe`,
                isRead: false,
                createdAt: new Date()
            });
        } catch (notifyError) {
            console.error('Error creating subscription notification:', notifyError);
        }

        return NextResponse.json(
            { message: 'Subscription request sent', status: 'pending' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH - Approve or reject subscription request
export async function PATCH(request) {
    try {
        const { fanEmail, creatorEmail, action } = await request.json();

        if (!fanEmail || !creatorEmail || !action) {
            return NextResponse.json(
                { error: 'Fan email, creator email, and action are required' },
                { status: 400 }
            );
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Action must be approve or reject' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const subscriptions = db.collection('subscriptions');

        if (action === 'approve') {
            // Update status to approved
            await subscriptions.updateOne(
                { fanEmail, creatorEmail, status: 'pending' },
                {
                    $set: {
                        status: 'approved',
                        approvedAt: new Date(),
                    },
                }
            );

            return NextResponse.json(
                { message: 'Subscription approved' },
                { status: 200 }
            );
        } else {
            // Delete the request
            await subscriptions.deleteOne({ fanEmail, creatorEmail, status: 'pending' });

            return NextResponse.json(
                { message: 'Subscription rejected' },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error('Update subscription error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Cancel subscription request or unsubscribe
export async function DELETE(request) {
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

        await subscriptions.deleteOne({ fanEmail, creatorEmail });

        return NextResponse.json(
            { message: 'Subscription removed' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
