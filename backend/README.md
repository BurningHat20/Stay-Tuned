# Backend

This is the backend for the Stay Tuned app.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file with:

   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=stay_tuned
   JWT_SECRET=your_jwt_secret
   ```

3. Initialize the database:

   ```bash
   npm run db:init
   ```

4. Seed the database with fake data:
   ```bash
   npm run db:seed
   ```

## Running the Server

- Development: `npm run dev`
- Production: `npm start`

## Database Seeding

The `npm run db:seed` command will populate your database with realistic fake data including:

- 100 users with realistic profiles
- 50 channels across different categories
- 500 posts with various types
- Random subscriptions between users and channels
- Reactions on posts
- Notifications
- Active user sessions

You can modify the seeding configuration in `src/scripts/seed.js`.
