import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
    try {
        const { fullName, email, password, userType } = await request.json();

        // Validate input
        if (!fullName || !email || !password || !userType) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (!['creator', 'fan'].includes(userType)) {
            return NextResponse.json(
                { error: 'Invalid user type' },
                { status: 400 }
            );
        }

        // Connect to database
        const client = await clientPromise;
        const db = client.db('privatefan');
        const users = db.collection('users');

        // Check if user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await users.insertOne({
            fullName,
            email,
            password: hashedPassword,
            userType,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Return user data (without password)
        return NextResponse.json(
            {
                message: 'User created successfully',
                user: {
                    id: result.insertedId,
                    fullName,
                    email,
                    userType,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
