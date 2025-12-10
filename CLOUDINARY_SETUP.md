# Cloudinary Setup Guide for Private Fan

## 🌟 Overview

The Posts feature now supports image uploads through Cloudinary, a cloud-based image and video management service.

## 📋 Prerequisites

You need a Cloudinary account (free tier is sufficient for development).

## 🔧 Setup Instructions

### Step 1: Create a Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. Verify your email address
4. Log in to your Cloudinary dashboard

### Step 2: Get Your Cloudinary Credentials

1. Once logged in, you'll see your **Dashboard**
2. Find your credentials in the "Account Details" section:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Update Environment Variables

Open `.env.local` and update the Cloudinary configuration:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### Step 4: Restart the Development Server

After updating the environment variables, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Testing the Upload Feature

1. Navigate to http://localhost:3000/creator/posts
2. Click "Create New Post"
3. Fill in the title and description
4. Click "Choose File" or drag and drop an image
5. Wait for the upload to complete
6. Click "Create Post"

## 📁 Cloudinary Folder Structure

Images are automatically organized in Cloudinary:
- Folder: `privatefan/posts`
- All post images will be stored here

## 🎨 Features Implemented

### Posts Page
- ✅ Create new posts with title, description, and image
- ✅ Upload images to Cloudinary (max 5MB)
- ✅ Image preview before posting
- ✅ Display all posts in a grid layout
- ✅ Real-time stats (Total Posts, Views, Likes, Comments)
- ✅ Delete posts
- ✅ Responsive design

### Image Upload
- ✅ Drag and drop support
- ✅ File type validation (images only)
- ✅ File size validation (max 5MB)
- ✅ Upload progress indicator
- ✅ Image preview
- ✅ Remove uploaded image before posting

### Database
- Posts are stored in MongoDB with:
  - Title
  - Description
  - Image URL (from Cloudinary)
  - Creator email and name
  - Status (published/draft/scheduled)
  - Likes, views, comments
  - Timestamps

## 🔒 Security Notes

1. **API Secret**: Never commit your `.env.local` file to version control
2. **Public Cloud Name**: The `NEXT_PUBLIC_` prefix makes it available to the browser (this is safe)
3. **API Key & Secret**: These are server-side only and not exposed to the browser

## 🚀 API Endpoints

### POST /api/upload
Upload an image to Cloudinary
- **Input**: FormData with file
- **Output**: { url, publicId }

### POST /api/posts
Create a new post
- **Input**: { title, description, imageUrl, creatorEmail, creatorName, status }
- **Output**: { message, post }

### GET /api/posts?creatorEmail=email
Fetch all posts for a creator
- **Output**: { posts: [...] }

### DELETE /api/posts?postId=id
Delete a post
- **Output**: { message }

## 🎯 Post Schema

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  imageUrl: String (Cloudinary URL),
  creatorEmail: String,
  creatorName: String,
  status: String ('published', 'draft', 'scheduled'),
  likes: Number,
  views: Number,
  comments: Array,
  createdAt: Date,
  updatedAt: Date
}
```

## 📊 Stats Calculation

Stats are automatically calculated from posts:
- **Total Posts**: Count of all posts
- **Total Views**: Sum of all post views
- **Total Likes**: Sum of all post likes
- **Total Comments**: Sum of all comments across posts

## 🐛 Troubleshooting

### "Upload failed" error
- Check your Cloudinary credentials in `.env.local`
- Make sure you restarted the dev server after updating env variables
- Verify your Cloudinary account is active

### Images not displaying
- Check the image URL in the database
- Verify Cloudinary cloud name is correct
- Check browser console for errors

### "No file provided" error
- Make sure you're selecting an image file
- Check file size is under 5MB
- Verify file type is an image (PNG, JPG, GIF, etc.)

## 💡 Tips

1. **Free Tier Limits**: Cloudinary free tier includes:
   - 25 GB storage
   - 25 GB bandwidth/month
   - This is plenty for development and small-scale production

2. **Image Optimization**: Cloudinary automatically optimizes images for web delivery

3. **Transformations**: You can add image transformations in the upload API route (resize, crop, etc.)

4. **Video Support**: To add video support later, update the upload route to accept video files

## 🔄 Next Steps

Now that posts are functional, you can:
1. Add post editing functionality
2. Implement draft and scheduled posts
3. Add video upload support
4. Create a fan-facing feed to view posts
5. Add likes and comments functionality
6. Implement post analytics

---

**Note**: Make sure to keep your Cloudinary credentials secure and never share them publicly!
