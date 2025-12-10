import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Fetch user profile
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const users = db.collection('users');

        const user = await users.findOne(
            { email },
            { projection: { password: 0 } }
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Fetch profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update user profile
export async function PUT(request) {
    try {
        const { email, fullName, bio, profileImage, subscriptionRate } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('privatefan');
        const users = db.collection('users');

        const updateData = {
            updatedAt: new Date(),
        };

        if (fullName) updateData.fullName = fullName;
        if (bio !== undefined) updateData.bio = bio;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (subscriptionRate !== undefined) updateData.subscriptionRate = parseFloat(subscriptionRate);

        const result = await users.updateOne(
            { email },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Fetch updated user
        const updatedUser = await users.findOne(
            { email },
            { projection: { password: 0 } }
        );

        return NextResponse.json(
            {
                message: 'Profile updated successfully',
                user: updatedUser,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
