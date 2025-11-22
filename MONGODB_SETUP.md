# MongoDB Environment Setup

Add the following to your `.env.local` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/estate-access-control

# JWT Secret (change in production)
JWT_SECRET=your-secret-key-change-in-production-use-long-random-string

# Optional: App URL for emails
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## MongoDB Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Update MONGODB_URI in .env.local:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/estate-access-control?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Use default connection string in .env.local:
   ```
   MONGODB_URI=mongodb://localhost:27017/estate-access-control
   ```

## Restart Development Server

After updating .env.local, restart your dev server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

The super admin will be automatically created on first connect:
- **Email**: admin123@test.com
- **Password**: Password123*
