import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Fetch all creators or a single creator by email
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        const client = await clientPromise;
        const db = client.db('privatefan');
        const users = db.collection('users');

        // Fetch single creator by email
        if (email) {
            const creator = await users.findOne(
                { email, userType: 'creator' },
                { projection: { password: 0 } }
            );

            if (!creator) {
                return NextResponse.json(
                    { error: 'Creator not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ creator }, { status: 200 });
        }

        // Fetch all creators or search by name
        let query = { userType: 'creator' };

        const search = searchParams.get('search');
        if (search) {
            query.fullName = { $regex: search, $options: 'i' };
        }

        const creators = await users
            .find(query)
            .project({ password: 0 }) // Exclude password field
            .limit(20) // Limit to 20 creators
            .toArray();

        return NextResponse.json({ creators }, { status: 200 });
    } catch (error) {
        console.error('Fetch creators error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
