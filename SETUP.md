# Private Fan - Authentication Setup Guide

This application now includes full authentication with MongoDB backend support.

## 🚀 Features Implemented

- ✅ User Registration (Signup)
- ✅ User Login
- ✅ Password Hashing with bcrypt
- ✅ MongoDB Database Integration
- ✅ User Type Selection (Creator/Fan)
- ✅ Protected Dashboard Route
- ✅ Session Management with localStorage

## 📋 Prerequisites

You need either:
- **Option A**: MongoDB installed locally, OR
- **Option B**: MongoDB Atlas account (free cloud database)

## 🔧 Setup Instructions

### Option A: Using Local MongoDB

1. **Install MongoDB** (if not already installed):
   - macOS: `brew install mongodb-community`
   - Or download from: https://www.mongodb.com/try/download/community

2. **Start MongoDB**:
   ```bash
   brew services start mongodb-community
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   ```
   If it connects, you're good to go!

4. The `.env.local` file is already configured for local MongoDB:
   ```
   MONGODB_URI=mongodb://localhost:27017/privatefan
   ```

### Option B: Using MongoDB Atlas (Cloud)

1. **Create a free account** at https://www.mongodb.com/cloud/atlas

2. **Create a new cluster** (free tier is fine)

3. **Get your connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

4. **Update `.env.local`**:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/privatefan?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your actual credentials

5. **Whitelist your IP**:
   - In Atlas, go to Network Access
   - Add your current IP address (or use 0.0.0.0/0 for development)

## 🏃 Running the Application

1. **Install dependencies** (if not done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   - Navigate to http://localhost:3000
   - You should see the login page

## 📝 Testing the Application

### Create a New Account

1. Go to http://localhost:3000
2. Click "Sign up for free"
3. Fill in the form:
   - Select user type (Creator or Fan)
   - Enter your full name
   - Enter your email
   - Create a password
   - Confirm password
   - Agree to terms
4. Click "Create Account"
5. You'll be redirected to the dashboard

### Login with Existing Account

1. Go to http://localhost:3000
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

## 🗄️ Database Structure

The application creates a database called `privatefan` with a `users` collection.

### User Schema:
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String,
  password: String (hashed),
  userType: String ('creator' or 'fan'),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- ✅ Passwords are hashed using bcrypt (10 rounds)
- ✅ Email uniqueness validation
- ✅ Input validation on both frontend and backend
- ✅ Protected routes (dashboard requires authentication)
- ✅ Error handling for invalid credentials

## 📱 Application Routes

- `/` - Login page
- `/signup` - Registration page
- `/dashboard` - Protected dashboard (requires authentication)

## 🛠️ API Endpoints

### POST /api/auth/signup
Register a new user
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "creator"
}
```

### POST /api/auth/login
Authenticate a user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is running (local) or your Atlas connection string is correct
- Check your `.env.local` file has the correct `MONGODB_URI`
- Restart the dev server after changing `.env.local`

### "User already exists"
- This email is already registered
- Try logging in instead or use a different email

### "Invalid email or password"
- Check your credentials
- Passwords are case-sensitive

## 🔄 Next Steps

The dashboard is currently a temporary page showing:
- User information
- Account type
- Coming soon features

You can now build out:
- Creator dashboard with content management
- Fan dashboard with creator discovery
- Subscription features
- Messaging system
- And more!

## 📚 Technologies Used

- **Frontend**: Next.js 16, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: bcryptjs for password hashing
- **State Management**: React hooks + localStorage

---

**Note**: This is a development setup. For production, you should:
- Use proper session management (JWT tokens, cookies)
- Add HTTPS
- Implement refresh tokens
- Add rate limiting
- Use environment-specific configurations
- Add proper error logging
