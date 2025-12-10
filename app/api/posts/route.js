import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all posts for a creator
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const creatorEmail = searchParams.get('creatorEmail');
        const fanEmail = searchParams.get('fanEmail');

        if (!creatorEmail) {
            return NextResponse.json(
                { error: 'Creator email is required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const posts = db.collection('posts');

        const creatorPosts = await posts
            .find({ creatorEmail })
            .sort({ createdAt: -1 })
            .toArray();

        // Add isLiked field if fanEmail provided
        if (fanEmail) {
            creatorPosts.forEach(post => {
                post.isLiked = post.likedBy?.includes(fanEmail) || false;
            });
        }

        return NextResponse.json({ posts: creatorPosts }, { status: 200 });
    } catch (error) {
        console.error('Fetch posts error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create a new post
export async function POST(request) {
    try {
        const { title, description, imageUrl, creatorEmail, creatorName, status, visibility } = await request.json();

        // Validate input
        if (!title || !creatorEmail) {
            return NextResponse.json(
                { error: 'Title and creator email are required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const posts = db.collection('posts');

        // Create post
        const result = await posts.insertOne({
            title,
            description: description || '',
            imageUrl: imageUrl || null,
            creatorEmail,
            creatorName,
            status: status || 'published', // published, draft, scheduled
            visibility: visibility || 'public', // public, private
            likes: 0,
            views: 0,
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const newPost = await posts.findOne({ _id: result.insertedId });

        // Generate notifications for subscribers
        try {
            const subscriptions = db.collection('subscriptions');
            const notifications = db.collection('notifications');

            const subscribers = await subscriptions.find({
                creatorEmail,
                status: 'approved'
            }).toArray();

            if (subscribers.length > 0) {
                const notificationDocs = subscribers.map(sub => ({
                    recipientEmail: sub.fanEmail,
                    senderEmail: creatorEmail,
                    type: 'new_post',
                    relatedId: result.insertedId,
                    message: `${creatorName} posted a new ${imageUrl ? 'photo' : 'update'}`,
                    isRead: false,
                    createdAt: new Date()
                }));

                await notifications.insertMany(notificationDocs);
            }
        } catch (notifyError) {
            console.error('Error creating notifications:', notifyError);
            // Don't fail the request if notifications fail
        }

        return NextResponse.json(
            {
                message: 'Post created successfully',
                post: newPost,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH - Toggle like on a post
export async function PATCH(request) {
    try {
        const { postId, fanEmail } = await request.json();

        if (!postId || !fanEmail) {
            return NextResponse.json(
                { error: 'Post ID and fan email are required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const posts = db.collection('posts');

        const post = await posts.findOne({ _id: new ObjectId(postId) });
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const isLiked = post.likedBy?.includes(fanEmail);
        let update;

        if (isLiked) {
            // Unlike
            update = {
                $inc: { likes: -1 },
                $pull: { likedBy: fanEmail }
            };
        } else {
            // Like
            update = {
                $inc: { likes: 1 },
                $addToSet: { likedBy: fanEmail }
            };

            // Create notification for creator
            try {
                const notifications = db.collection('notifications');
                // Check if notification already exists for this post/fan to avoid spamming
                const existingNotif = await notifications.findOne({
                    recipientEmail: post.creatorEmail,
                    senderEmail: fanEmail,
                    type: 'like',
                    relatedId: new ObjectId(postId)
                });

                if (!existingNotif) {
                    await notifications.insertOne({
                        recipientEmail: post.creatorEmail,
                        senderEmail: fanEmail,
                        type: 'like',
                        relatedId: new ObjectId(postId),
                        message: `${fanEmail} liked your post "${post.title}"`,
                        isRead: false,
                        createdAt: new Date()
                    });
                }
            } catch (notifyError) {
                console.error('Error creating like notification:', notifyError);
            }
        }

        await posts.updateOne(
            { _id: new ObjectId(postId) },
            update
        );

        // Fetch updated post to return correct count
        const updatedPost = await posts.findOne({ _id: new ObjectId(postId) });

        return NextResponse.json({
            message: 'Success',
            likes: updatedPost.likes,
            isLiked: !isLiked
        }, { status: 200 });

    } catch (error) {
        console.error('Like error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a post
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');

        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const posts = db.collection('posts');

        await posts.deleteOne({ _id: new ObjectId(postId) });

        return NextResponse.json(
            { message: 'Post deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete post error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
