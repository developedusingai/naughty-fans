import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const fanEmail = searchParams.get('fanEmail');

        const client = await clientPromise;
        const db = client.db('privatefan');

        // Base match criteria
        const matchStage = {
            visibility: 'public',
            status: 'published',
            imageUrl: { $ne: null, $ne: '' }
        };

        const pipeline = [{ $match: matchStage }];

        if (search) {
            // If searching, filter by title, description, or creator name
            pipeline.push({
                $match: {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                        { creatorName: { $regex: search, $options: 'i' } }
                    ]
                }
            });
            // Sort by newest first when searching
            pipeline.push({ $sort: { createdAt: -1 } });
            pipeline.push({ $limit: 50 });
        } else {
            // If not searching, return random posts
            pipeline.push({ $sample: { size: 20 } });
        }

        // If searching and/or sampling, constructed pipeline is:
        const finalPipeline = [
            ...pipeline,
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
        ];

        const posts = await db.collection('posts')
            .aggregate(finalPipeline)
            .toArray();

        // Add isLiked field if fanEmail provided
        if (fanEmail) {
            posts.forEach(post => {
                post.isLiked = post.likedBy?.includes(fanEmail) || false;
            });
        }

        return NextResponse.json({ posts }, { status: 200 });
    } catch (error) {
        console.error('Explore API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
