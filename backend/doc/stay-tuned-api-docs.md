# Stay Tuned - API Documentation

Version: 1.0.0  
Base URL: `http://localhost:5000/api`  
WebSocket URL: `ws://localhost:5000`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Channels](#channels)
3. [Posts](#posts)
4. [Subscriptions](#subscriptions)
5. [Users](#users)
6. [WebSocket Events](#websocket-events)
7. [Error Responses](#error-responses)
8. [Rate Limits](#rate-limits)

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "fullName": "John Doe"
}
```

**Request Validation:**
- `username`: Required, 3-50 characters, alphanumeric and underscores only
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `fullName`: Optional, maximum 100 characters

**Success Response:** `201 Created`
```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "avatar_url": null,
    "account_type": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

`400 Bad Request` - Validation errors
```json
{
  "error": "Validation failed",
  "details": [
    {
      "msg": "Username must be 3-50 characters and contain only letters, numbers, and underscores",
      "param": "username",
      "location": "body"
    }
  ]
}
```

`409 Conflict` - User already exists
```json
{
  "error": "User already exists with this email or username"
}
```

---

### Login User

Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "avatar_url": null,
    "account_type": "free",
    "status": "online",
    "last_seen": "2025-10-12T10:30:00.000Z",
    "created_at": "2025-10-01T08:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

`400 Bad Request` - Invalid credentials
```json
{
  "error": "Invalid email or password"
}
```

---

### Get User Profile

Get authenticated user's profile information.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "bio": "Software developer and tech enthusiast",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_verified": false,
    "account_type": "free",
    "status": "online",
    "created_at": "2025-10-01T08:00:00.000Z"
  }
}
```

**Error Responses:**

`401 Unauthorized` - Missing or invalid token
```json
{
  "error": "Access token required"
}
```

---

### Update User Profile

Update user profile information.

**Endpoint:** `PATCH /auth/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "full_name": "John Smith",
  "bio": "Full-stack developer | Coffee lover ☕",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Request Validation:**
- `full_name`: Optional, maximum 100 characters
- `bio`: Optional, maximum 500 characters
- `avatar_url`: Optional, must be valid URL

**Success Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Smith",
    "bio": "Full-stack developer | Coffee lover ☕",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "is_verified": false,
    "account_type": "free",
    "status": "online",
    "created_at": "2025-10-01T08:00:00.000Z"
  }
}
```

---

### Update User Status

Update user's online status.

**Endpoint:** `PATCH /auth/status`

**Authentication:** Required

**Request Body:**
```json
{
  "status": "away"
}
```

**Request Validation:**
- `status`: Required, must be one of: `online`, `away`, `busy`, `offline`

**Success Response:** `200 OK`
```json
{
  "message": "Status updated successfully",
  "status": "away"
}
```

---

## 📢 Channels

### Create Channel

Create a new broadcasting channel.

**Endpoint:** `POST /channels`

**Authentication:** Required

**Request Body:**
```json
{
  "channelName": "Tech Talks Daily",
  "channelHandle": "tech-talks-daily",
  "description": "Daily insights on technology and programming",
  "channelType": "professional",
  "category": "Technology",
  "isPrivate": false
}
```

**Request Validation:**
- `channelName`: Required, 1-100 characters
- `channelHandle`: Required, 3-50 characters, alphanumeric, hyphens, underscores only
- `description`: Optional, maximum 500 characters
- `channelType`: Optional, one of: `personal`, `professional`, `interest`, `event`, `business`
- `category`: Optional, maximum 50 characters
- `isPrivate`: Optional, boolean

**Success Response:** `201 Created`
```json
{
  "message": "Channel created successfully",
  "channel": {
    "id": 1,
    "user_id": 1,
    "channel_name": "Tech Talks Daily",
    "channel_handle": "tech-talks-daily",
    "description": "Daily insights on technology and programming",
    "channel_type": "professional",
    "category": "Technology",
    "is_private": false,
    "is_monetized": false,
    "subscription_price": 0.00,
    "subscriber_count": 0,
    "post_count": 0,
    "is_active": true,
    "cover_image_url": null,
    "created_at": "2025-10-12T10:30:00.000Z",
    "updated_at": "2025-10-12T10:30:00.000Z",
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": null,
    "is_verified": false,
    "is_subscribed": false
  }
}
```

**Error Responses:**

`400 Bad Request` - Channel limit reached
```json
{
  "error": "Channel limit reached for free account (3 channels)"
}
```

`409 Conflict` - Handle already taken
```json
{
  "error": "Channel handle already taken"
}
```

---

### Get Channel by ID

Get detailed information about a specific channel.

**Endpoint:** `GET /channels/:channelId`

**Authentication:** Optional (returns is_subscribed if authenticated)

**Path Parameters:**
- `channelId`: Channel ID (integer)

**Success Response:** `200 OK`
```json
{
  "channel": {
    "id": 1,
    "user_id": 1,
    "channel_name": "Tech Talks Daily",
    "channel_handle": "tech-talks-daily",
    "description": "Daily insights on technology and programming",
    "channel_type": "professional",
    "category": "Technology",
    "is_private": false,
    "is_monetized": false,
    "subscription_price": 0.00,
    "subscriber_count": 150,
    "post_count": 42,
    "is_active": true,
    "cover_image_url": "https://example.com/cover.jpg",
    "created_at": "2025-09-01T08:00:00.000Z",
    "updated_at": "2025-10-12T10:30:00.000Z",
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_verified": true,
    "is_subscribed": true
  }
}
```

**Error Responses:**

`404 Not Found`
```json
{
  "error": "Channel not found"
}
```

---

### Get Channel by Handle

Get channel information using channel handle.

**Endpoint:** `GET /channels/handle/:handle`

**Authentication:** Optional

**Path Parameters:**
- `handle`: Channel handle (string)

**Success Response:** `200 OK`
```json
{
  "channel": {
    "id": 1,
    "channel_name": "Tech Talks Daily",
    "channel_handle": "tech-talks-daily",
    "description": "Daily insights on technology and programming",
    "subscriber_count": 150,
    "post_count": 42,
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_verified": true,
    "is_subscribed": false
  }
}
```

---

### Discover Channels

Browse and search for channels.

**Endpoint:** `GET /channels/discover`

**Authentication:** Optional

**Query Parameters:**
- `category`: Filter by category (optional)
- `search`: Search in name and description (optional)
- `limit`: Number of results (default: 20, max: 50)
- `offset`: Pagination offset (default: 0)

**Example Request:**
```
GET /channels/discover?category=Technology&search=programming&limit=10&offset=0
```

**Success Response:** `200 OK`
```json
{
  "channels": [
    {
      "id": 1,
      "channel_name": "Tech Talks Daily",
      "channel_handle": "tech-talks-daily",
      "description": "Daily insights on technology and programming",
      "channel_type": "professional",
      "category": "Technology",
      "subscriber_count": 150,
      "post_count": 42,
      "cover_image_url": "https://example.com/cover.jpg",
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "is_verified": true
    },
    {
      "id": 2,
      "channel_name": "Code with Sarah",
      "channel_handle": "code-with-sarah",
      "description": "Programming tutorials and tips",
      "channel_type": "professional",
      "category": "Technology",
      "subscriber_count": 320,
      "post_count": 89,
      "cover_image_url": null,
      "username": "sarahdev",
      "full_name": "Sarah Johnson",
      "avatar_url": "https://example.com/sarah.jpg",
      "is_verified": false
    }
  ]
}
```

---

### Get Trending Channels

Get channels with most activity in the last 7 days.

**Endpoint:** `GET /channels/trending`

**Authentication:** Optional

**Query Parameters:**
- `limit`: Number of results (default: 20, max: 50)

**Success Response:** `200 OK`
```json
{
  "channels": [
    {
      "id": 5,
      "channel_name": "Breaking Tech News",
      "channel_handle": "breaking-tech-news",
      "description": "Latest tech news as it happens",
      "channel_type": "professional",
      "category": "Technology",
      "subscriber_count": 1250,
      "post_count": 340,
      "recent_posts": 45,
      "username": "technews",
      "full_name": "Tech News Daily",
      "avatar_url": "https://example.com/technews.jpg",
      "is_verified": true
    }
  ]
}
```

---

### Get My Channels

Get all channels owned by authenticated user.

**Endpoint:** `GET /channels/my-channels`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "channels": [
    {
      "id": 1,
      "channel_name": "Tech Talks Daily",
      "channel_handle": "tech-talks-daily",
      "description": "Daily insights on technology and programming",
      "channel_type": "professional",
      "category": "Technology",
      "is_private": false,
      "is_monetized": false,
      "subscriber_count": 150,
      "post_count": 42,
      "is_active": true,
      "created_at": "2025-09-01T08:00:00.000Z"
    }
  ]
}
```

---

### Get User's Channels

Get all channels owned by a specific user.

**Endpoint:** `GET /channels/user/:userId`

**Authentication:** Not required

**Path Parameters:**
- `userId`: User ID (integer)

**Success Response:** `200 OK`
```json
{
  "channels": [
    {
      "id": 1,
      "channel_name": "Tech Talks Daily",
      "channel_handle": "tech-talks-daily",
      "description": "Daily insights on technology and programming",
      "channel_type": "professional",
      "category": "Technology",
      "subscriber_count": 150,
      "post_count": 42,
      "created_at": "2025-09-01T08:00:00.000Z"
    }
  ]
}
```

---

### Update Channel

Update channel information.

**Endpoint:** `PATCH /channels/:channelId`

**Authentication:** Required (must be channel owner)

**Path Parameters:**
- `channelId`: Channel ID (integer)

**Request Body:**
```json
{
  "channel_name": "Tech Talks Daily - Updated",
  "description": "Daily insights on technology, programming, and innovation",
  "category": "Technology",
  "is_private": false,
  "cover_image_url": "https://example.com/new-cover.jpg"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Channel updated successfully",
  "channel": {
    "id": 1,
    "channel_name": "Tech Talks Daily - Updated",
    "description": "Daily insights on technology, programming, and innovation",
    "category": "Technology",
    "is_private": false,
    "cover_image_url": "https://example.com/new-cover.jpg",
    "updated_at": "2025-10-12T11:00:00.000Z"
  }
}
```

**Error Responses:**

`403 Forbidden` - Not channel owner
```json
{
  "error": "Unauthorized to update this channel"
}
```

---

### Delete Channel

Soft delete a channel (sets is_active to false).

**Endpoint:** `DELETE /channels/:channelId`

**Authentication:** Required (must be channel owner)

**Path Parameters:**
- `channelId`: Channel ID (integer)

**Success Response:** `200 OK`
```json
{
  "message": "Channel deleted successfully"
}
```

**Error Responses:**

`403 Forbidden`
```json
{
  "error": "Unauthorized to delete this channel"
}
```

---

## 📝 Posts

### Create Post

Create a new post in a channel.

**Endpoint:** `POST /posts`

**Authentication:** Required

**Rate Limit:** 10 posts per minute

**Request Body:**
```json
{
  "channelId": 1,
  "content": "Just launched a new feature! Check out the live demo at example.com 🚀",
  "postType": "text",
  "mediaUrl": null
}
```

**Request Validation:**
- `channelId`: Required, valid channel ID
- `content`: Required, 1-500 characters
- `postType`: Optional, one of: `text`, `voice`, `image`, `location`, `status`
- `mediaUrl`: Optional, valid URL

**Success Response:** `201 Created`
```json
{
  "message": "Post created successfully",
  "post": {
    "id": 123,
    "channel_id": 1,
    "user_id": 1,
    "content": "Just launched a new feature! Check out the live demo at example.com 🚀",
    "post_type": "text",
    "media_url": null,
    "is_pinned": false,
    "reaction_count": 0,
    "created_at": "2025-10-12T10:30:00.000Z",
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "channel_name": "Tech Talks Daily",
    "channel_handle": "tech-talks-daily"
  }
}
```

**Error Responses:**

`400 Bad Request` - Content too long
```json
{
  "error": "Post content exceeds maximum length of 500 characters"
}
```

`403 Forbidden` - Not channel owner
```json
{
  "error": "Unauthorized to post to this channel"
}
```

`429 Too Many Requests` - Rate limit exceeded
```json
{
  "error": "Too many posts, please slow down"
}
```

---

### Get User Feed

Get posts from all subscribed channels.

**Endpoint:** `GET /posts/feed`

**Authentication:** Required

**Query Parameters:**
- `limit`: Number of posts (default: 20, max: 50)
- `offset`: Pagination offset (default: 0)

**Example Request:**
```
GET /posts/feed?limit=20&offset=0
```

**Success Response:** `200 OK`
```json
{
  "posts": [
    {
      "id": 123,
      "channel_id": 1,
      "user_id": 1,
      "content": "Just launched a new feature! 🚀",
      "post_type": "text",
      "media_url": null,
      "is_pinned": false,
      "reaction_count": 15,
      "created_at": "2025-10-12T10:30:00.000Z",
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "channel_name": "Tech Talks Daily",
      "channel_handle": "tech-talks-daily",
      "user_reaction": "heart"
    },
    {
      "id": 122,
      "channel_id": 2,
      "user_id": 3,
      "content": "New tutorial on React hooks coming tomorrow!",
      "post_type": "text",
      "media_url": null,
      "is_pinned": false,
      "reaction_count": 8,
      "created_at": "2025-10-12T09:15:00.000Z",
      "username": "sarahdev",
      "full_name": "Sarah Johnson",
      "avatar_url": "https://example.com/sarah.jpg",
      "channel_name": "Code with Sarah",
      "channel_handle": "code-with-sarah",
      "user_reaction": null
    }
  ]
}
```

---

### Get Channel Posts

Get all posts from a specific channel.

**Endpoint:** `GET /posts/channel/:channelId`

**Authentication:** Not required

**Path Parameters:**
- `channelId`: Channel ID (integer)

**Query Parameters:**
- `limit`: Number of posts (default: 20, max: 50)
- `offset`: Pagination offset (default: 0)

**Example Request:**
```
GET /posts/channel/1?limit=20&offset=0
```

**Success Response:** `200 OK`
```json
{
  "posts": [
    {
      "id": 123,
      "channel_id": 1,
      "user_id": 1,
      "content": "Just launched a new feature! 🚀",
      "post_type": "text",
      "media_url": null,
      "is_pinned": false,
      "reaction_count": 15,
      "created_at": "2025-10-12T10:30:00.000Z",
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "user_reaction": null
    }
  ]
}
```

---

### React to Post

Add a reaction to a post.

**Endpoint:** `POST /posts/:postId/react`

**Authentication:** Required

**Path Parameters:**
- `postId`: Post ID (integer)

**Request Body:**
```json
{
  "reactionType": "heart"
}
```

**Request Validation:**
- `reactionType`: Required, one of: `heart`, `clap`, `fire`, `hundred`

**Success Response:** `200 OK`
```json
{
  "message": "Reaction added successfully"
}
```

**Note:** If user already reacted, this will update their existing reaction.

---

### Remove Reaction

Remove reaction from a post.

**Endpoint:** `DELETE /posts/:postId/react`

**Authentication:** Required

**Path Parameters:**
- `postId`: Post ID (integer)

**Success Response:** `200 OK`
```json
{
  "message": "Reaction removed successfully"
}
```

---

### Delete Post

Delete a post (must be post owner).

**Endpoint:** `DELETE /posts/:postId`

**Authentication:** Required

**Path Parameters:**
- `postId`: Post ID (integer)

**Success Response:** `200 OK`
```json
{
  "message": "Post deleted successfully"
}
```

**Error Responses:**

`403 Forbidden`
```json
{
  "error": "Unauthorized to delete this post"
}
```

---

## 👥 Subscriptions

### Subscribe to Channel

Subscribe to a channel to receive updates.

**Endpoint:** `POST /subscriptions/:channelId`

**Authentication:** Required

**Path Parameters:**
- `channelId`: Channel ID (integer)

**Request Body:**
```json
{
  "notificationLevel": "all"
}
```

**Request Validation:**
- `notificationLevel`: Optional, one of: `all`, `important`, `none` (default: `all`)

**Success Response:** `201 Created`
```json
{
  "message": "Subscribed successfully"
}
```

**Error Responses:**

`400 Bad Request` - Already subscribed
```json
{
  "error": "Already subscribed to this channel"
}
```

`404 Not Found` - Channel doesn't exist
```json
{
  "error": "Channel not found"
}
```

---

### Unsubscribe from Channel

Unsubscribe from a channel.

**Endpoint:** `DELETE /subscriptions/:channelId`

**Authentication:** Required

**Path Parameters:**
- `channelId`: Channel ID (integer)

**Success Response:** `200 OK`
```json
{
  "message": "Unsubscribed successfully"
}
```

**Error Responses:**

`404 Not Found`
```json
{
  "error": "Subscription not found"
}
```

---

### Get User Subscriptions

Get all channels the user is subscribed to.

**Endpoint:** `GET /subscriptions`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "subscriptions": [
    {
      "id": 1,
      "user_id": 5,
      "channel_name": "Tech Talks Daily",
      "channel_handle": "tech-talks-daily",
      "description": "Daily insights on technology and programming",
      "channel_type": "professional",
      "category": "Technology",
      "subscriber_count": 150,
      "post_count": 42,
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "is_verified": true,
      "notification_level": "all",
      "subscribed_at": "2025-10-01T10:00:00.000Z"
    }
  ]
}
```

---

### Get Channel Subscribers

Get list of users subscribed to a channel.

**Endpoint:** `GET /subscriptions/:channelId/subscribers`

**Authentication:** Not required

**Path Parameters:**
- `channelId`: Channel ID (integer)

**Query Parameters:**
- `limit`: Number of results (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Success Response:** `200 OK`
```json
{
  "subscribers": [
    {
      "id": 5,
      "username": "janesmith",
      "full_name": "Jane Smith",
      "avatar_url": "https://example.com/jane.jpg",
      "is_verified": false,
      "notification_level": "all",
      "subscribed_at": "2025-10-10T08:30:00.000Z"
    },
    {
      "id": 8,
      "username": "mikebrown",
      "full_name": "Mike Brown",
      "avatar_url": null,
      "is_verified": false,
      "notification_level": "important",
      "subscribed_at": "2025-10-09T14:20:00.000Z"
    }
  ]
}
```

---

### Update Notification Level

Change notification preferences for a subscribed channel.

**Endpoint:** `PATCH /subscriptions/:channelId/notifications`

**Authentication:** Required

**Path Parameters:**
- `channelId`: Channel ID (integer)

**Request Body:**
```json
{
  "notificationLevel": "important"
}
```

**Request Validation:**
- `notificationLevel`: Required, one of: `all`, `important`, `none`

**Success Response:** `200 OK`
```json
{
  "message": "Notification level updated successfully"
}
```

**Notification Levels:**
- `all`: Receive all post notifications
- `important`: Receive only important/pinned posts
- `none`: No notifications (still subscribed)

---

## 👤 Users

### Search Users

Search for users by username or full name.

**Endpoint:** `GET /users/search`

**Authentication:** Optional

**Query Parameters:**
- `q`: Search query (required, minimum 2 characters)
- `limit`: Number of results (default: 20, max: 50)

**Example Request:**
```
GET /users/search?q=john&limit=10
```

**Success Response:** `200 OK`
```json
{
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "full_name": "John Doe",
      "bio": "Software developer and tech enthusiast",
      "avatar_url": "https://example.com/avatar.jpg",
      "is_verified": true
    },
    {
      "id": 12,
      "username": "johnjones",
      "full_name": "John Jones",
      "bio": "Digital marketing expert",
      "avatar_url": null,
      "is_verified": false
    }
  ]
}
```

---

### Get User Details

Get detailed information about a specific user.

**Endpoint:** `GET /users/:userId`

**Authentication:** Optional

**Path Parameters:**
- `userId`: User ID (integer)

**Success Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "full_name": "John Doe",
    "bio": "Software developer and tech enthusiast",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_verified": true,
    "account_type": "plus",
    "created_at": "2025-09-01T08:00:00.000Z",
    "channelCount": 5
  }
}
```

**Error Responses:**

`404 Not Found`
```json
{
  "error": "User not found"
}
```

---

## 🔌 WebSocket Events

Connect to WebSocket server with authentication:

```javascript
const socket = io('ws://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});
```

### Client → Server Events

#### Join Channel
Join a channel room to receive real-time updates.

**Event:** `join_channel`

**Payload:**
```javascript
socket.emit('join_channel', channelId);
```

**Example:**
```javascript
socket.emit('join_channel', 1);
```

---

#### Leave Channel
Leave a channel room.

**Event:** `leave_channel`

**Payload:**
```javascript
socket.emit('leave_channel', channelId);
```

---

#### User Typing
Broadcast typing indicator to channel.

**Event:** `user_typing`

**Payload:**
```javascript
socket.emit('user_typing', {
  channelId: 1
});
```

---

#### Update Status
Update user's online status.

**Event:** `update_status`

**Payload:**
```javascript
socket.emit('update_status', 'away');
// Valid statuses: 'online', 'away', 'busy', 'offline'
```

---

### Server → Client Events

#### New Post
Receive notification when a new post is created in subscribed channel.

**Event:** `new_post`

**Payload:**
```javascript
socket.on('new_post', (data) => {
  console.log('New post:', data);
});
```

**Data Structure:**
```json
{
  "channelId": 1,
  "post": {
    "id": 123,
    "channel_id": 1,
    "user_id": 1,
    "content": "Just launched a new feature! 🚀",
    "post_type": "text",
    "created_at": "2025-10-12T10:30:00.000Z",
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "channel_name": "Tech Talks Daily",
    "channel_handle": "tech-talks-daily"
  }
}
```

---

#### User Presence
Receive updates when users come online/offline.

**Event:** `user_presence`

**Payload:**
```javascript
socket.on('user_presence', (data) => {
  console.log('User presence:', data);
});
```

**Data Structure:**
```json
{
  "userId": 5,
  "status": "online"
}
```

---

#### User Typing Indicator
Receive typing notifications in channels.

**Event:** `user_typing`

**Payload:**
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data);
});
```

**Data Structure:**
```json
{
  "userId": 5,
  "username": "janesmith",
  "channelId": 1
}
```

---

#### Notification
Receive real-time notifications.

**Event:** `notification`

**Payload:**
```javascript
socket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

**Data Structure:**
```json
{
  "id": 45,
  "type": "new_post",
  "title": "New post in Tech Talks Daily",
  "message": "Just launched a new feature! 🚀",
  "channelId": 1,
  "postId": 123,
  "created_at": "2025-10-12T10:30:00.000Z"
}
```

---

#### Error
Receive error messages from server.

**Event:** `error`

**Payload:**
```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data);
});
```

**Data Structure:**
```json
{
  "message": "Error description"
}
```

---

## ❌ Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

### Common Error Examples

#### Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "msg": "Username must be 3-50 characters",
      "param": "username",
      "location": "body"
    }
  ]
}
```

#### Authentication Error
```json
{
  "error": "Access token required"
}
```

#### Token Expired
```json
{
  "error": "Token expired"
}
```

#### Permission Denied
```json
{
  "error": "Unauthorized to perform this action"
}
```

#### Resource Not Found
```json
{
  "error": "Channel not found"
}
```

#### Rate Limit Exceeded
```json
{
  "error": "Too many requests, please try again later"
}
```

---

## 🚦 Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication (`/auth/login`, `/auth/register`) | 5 requests | 15 minutes |
| Post Creation (`POST /posts`) | 10 requests | 1 minute |
| General API | 100 requests | 15 minutes |

**Rate Limit Headers:**

Response includes rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1697112000
```

---

## 📊 Pagination

All list endpoints support pagination using `limit` and `offset` parameters.

**Example:**
```
GET /posts/feed?limit=20&offset=40
```

**Default Values:**
- `limit`: 20 (max: 50 for most endpoints)
- `offset`: 0

**Response Format:**
```json
{
  "items": [...],
  "pagination": {
    "limit": 20,
    "offset": 40,
    "total": 150
  }
}
```

---

## 🔍 Search & Filtering

### Channel Discovery Filters

**Category Filter:**
```
GET /channels/discover?category=Technology
```

**Search Query:**
```
GET /channels/discover?search=programming
```

**Combined:**
```
GET /channels/discover?category=Technology&search=programming&limit=10
```

---

## 🎯 Best Practices

### Authentication
1. Store JWT token securely (use secure storage)
2. Include token in Authorization header: `Bearer <token>`
3. Handle 401 errors by redirecting to login
4. Refresh tokens before expiration (7 days default)

### WebSocket Connection
1. Authenticate with JWT token in connection auth
2. Listen for `connect` and `disconnect` events
3. Implement reconnection logic
4. Handle connection errors gracefully

### Error Handling
1. Always check response status codes
2. Display user-friendly error messages
3. Log errors for debugging
4. Implement retry logic for network errors

### Performance
1. Use pagination for large data sets
2. Implement local caching where appropriate
3. Debounce search queries
4. Close WebSocket connections when not needed

### Rate Limits
1. Monitor rate limit headers
2. Implement exponential backoff on 429 errors
3. Queue requests if approaching limits
4. Display loading states during requests

---

## 📝 Example Integration

### Complete Authentication Flow

```javascript
// 1. Register
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'securepass123',
    fullName: 'John Doe'
  })
});

const { token, user } = await registerResponse.json();

// 2. Store token
localStorage.setItem('token', token);

// 3. Use token for authenticated requests
const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profile = await profileResponse.json();
```

### WebSocket Integration

```javascript
import io from 'socket.io-client';

const token = localStorage.getItem('token');

// Connect
const socket = io('ws://localhost:5000', {
  auth: { token }
});

// Listen for connection
socket.on('connect', () => {
  console.log('Connected to WebSocket');
  
  // Join channels
  socket.emit('join_channel', 1);
});

// Listen for new posts
socket.on('new_post', (data) => {
  console.log('New post received:', data.post);
  // Update UI with new post
  addPostToFeed(data.post);
});

// Handle errors
socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Cleanup on disconnect
socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket');
});
```

### Creating and Subscribing to Channels

```javascript
const token = localStorage.getItem('token');

// 1. Create a channel
const createChannelResponse = await fetch('http://localhost:5000/api/channels', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    channelName: 'My Tech Blog',
    channelHandle: 'my-tech-blog',
    description: 'Sharing my tech journey',
    channelType: 'personal',
    category: 'Technology'
  })
});

const { channel } = await createChannelResponse.json();

// 2. Subscribe to a channel
const subscribeResponse = await fetch(`http://localhost:5000/api/subscriptions/${channel.id}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    notificationLevel: 'all'
  })
});

// 3. Get subscribed channels
const subscriptionsResponse = await fetch('http://localhost:5000/api/subscriptions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { subscriptions } = await subscriptionsResponse.json();
```

---

## 🆘 Support

For issues or questions:
- GitHub Issues: [github.com/your-repo/issues](https://github.com)
- Email: support@staytuned.com
- Documentation: [docs.staytuned.com](https://docs.staytuned.com)

---

## 📄 License

MIT License - See LICENSE file for details

---

**API Version:** 1.0.0  
**Last Updated:** October 12, 2025  
**Status:** Production Ready ✅