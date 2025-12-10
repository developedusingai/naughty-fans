import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Fetch posts for the feed (only from subscribed creators)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fanEmail = searchParams.get('fanEmail');

        const client = await clientPromise;
        const db = client.db('privatefan');
        const posts = db.collection('posts');
        const subscriptions = db.collection('subscriptions');

        let query = { status: 'published' };

        // If fanEmail is provided, filter by subscribed creators
        if (fanEmail) {
            // Get all APPROVED subscriptions for this fan
            const userSubscriptions = await subscriptions
                .find({ fanEmail, status: 'approved' })
                .toArray();

            // Extract creator emails
            const subscribedCreators = userSubscriptions.map(sub => sub.creatorEmail);

            // If no approved subscriptions, return empty array
            if (subscribedCreators.length === 0) {
                return NextResponse.json({ posts: [] }, { status: 200 });
            }

            // Filter posts to only show from approved subscribed creators
            query.creatorEmail = { $in: subscribedCreators };
        }

        // Fetch posts with creator profile image
        const feedPosts = await posts.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $limit: 50 },
            {
                $lookup: {
                    from: 'users',
                    let: { creatorEmail: '$creatorEmail' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$email', '$$creatorEmail'] },
                                        { $eq: ['$userType', 'creator'] }
                                    ]
                                }
                            }
                        },
                        { $project: { profileImage: 1 } }
                    ],
                    as: 'creatorInfo'
                }
            },
            {
                $addFields: {
                    creatorProfileImage: { $arrayElemAt: ['$creatorInfo.profileImage', 0] }
                }
            },
            { $project: { creatorInfo: 0 } }
        ]).toArray();

        // Add isLiked field if fanEmail provided
        if (fanEmail) {
            feedPosts.forEach(post => {
                post.isLiked = post.likedBy?.includes(fanEmail) || false;
            });
        }

        return NextResponse.json({ posts: feedPosts }, { status: 200 });
    } catch (error) {
        console.error('Fetch feed error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
