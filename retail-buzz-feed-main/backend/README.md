# SLIIT Eats Backend API

A production-ready, scalable backend for the SLIIT Canteen Management System built with Node.js, Express, MongoDB, and real-time Socket.IO integration.

## 🚀 Features

### Authentication & Authorization
- **Google OAuth 2.0** integration with secure JWT tokens
- **Role-Based Access Control (RBAC)** with User, Canteen Owner, and Admin roles
- **JWT Refresh Tokens** with HTTP-only cookies for enhanced security
- **Protected Routes** with comprehensive middleware

### Canteen Management
- **Real-time Status Control** (Open/Closed) with Socket.IO updates
- **Full CRUD Operations** for canteen information
- **Operating Hours** management
- **Location & Contact** information
- **Image Upload** support
- **Rating System** integration

### Advanced Comment System
- **Full CRUD Operations** for comments
- **Nested Replies** (up to 3 levels deep)
- **Like/Dislike System** with mutual exclusivity
- **Admin Moderation** (pin, edit, delete any comment)
- **User Permissions** (edit/delete own comments only)
- **Real-time Updates** for all comment interactions

### Real-time Features
- **Socket.IO Integration** for live updates
- **Canteen Status Changes** broadcast to all clients
- **Comment Interactions** (create, edit, delete, reactions)
- **Typing Indicators** for comment sections
- **Live Notifications** system

### Security & Performance
- **Rate Limiting** for API protection
- **Input Validation** with express-validator
- **Helmet.js** for security headers
- **Compression** for improved performance
- **Error Handling** with comprehensive middleware
- **MongoDB Indexing** for optimized queries

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 4.4
- Google OAuth 2.0 Credentials

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/sliit_eats

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   JWT_REFRESH_EXPIRE=30d

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up Google OAuth 2.0**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
   - Copy Client ID and Client Secret to `.env`

5. **Start MongoDB**
   ```bash
   # Using MongoDB Community Server
   mongod

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/auth/me` | Get current user | Required |
| POST | `/api/auth/refresh` | Refresh JWT token | Optional |
| POST | `/api/auth/logout` | Logout user | Required |
| GET | `/api/auth/google` | Initiate Google OAuth | None |
| GET | `/api/auth/google/callback` | Google OAuth callback | None |

### Canteen Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/canteens` | Get all canteens | None |
| GET | `/api/canteens/:id` | Get single canteen | None |
| POST | `/api/canteens` | Create canteen | Canteen Owner/Admin |
| PUT | `/api/canteens/:id` | Update canteen | Owner/Admin |
| PATCH | `/api/canteens/:id/status` | Toggle canteen status | Owner/Admin |
| DELETE | `/api/canteens/:id` | Delete canteen | Owner/Admin |
| GET | `/api/canteens/:id/stats` | Get canteen statistics | Owner/Admin |
| GET | `/api/canteens/my/canteen` | Get owned canteen | Canteen Owner |

### Comment Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/comments/post/:postId` | Get post comments | Optional |
| GET | `/api/comments/:commentId/replies` | Get comment replies | Optional |
| POST | `/api/comments` | Create comment | Required |
| PUT | `/api/comments/:commentId` | Update comment | Owner/Admin |
| DELETE | `/api/comments/:commentId` | Delete comment | Owner/Admin |
| PATCH | `/api/comments/:commentId/pin` | Pin/unpin comment | Admin |
| POST | `/api/comments/:commentId/react` | Like/dislike comment | Required |
| DELETE | `/api/comments/:commentId/react` | Remove reaction | Required |

### User Routes (Admin Only)

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| GET | `/api/users/stats/overview` | Get user statistics | Admin |

## 🔄 Real-time Events

### Socket.IO Events

**Client to Server:**
- `joinPost` - Join post room for updates
- `leavePost` - Leave post room
- `joinCanteen` - Join canteen room
- `startTyping` - Start typing indicator
- `stopTyping` - Stop typing indicator

**Server to Client:**
- `canteenStatusChanged` - Canteen status updated
- `commentCreated` - New comment created
- `commentUpdated` - Comment updated
- `commentDeleted` - Comment deleted
- `commentReaction` - Comment reaction added/changed
- `commentPinned` - Comment pinned/unpinned
- `userTyping` - User is typing
- `userStoppedTyping` - User stopped typing

## 🗄️ Database Schema

### Users Collection
```javascript
{
  googleId: String,
  name: String,
  email: String,
  profilePicture: String,
  role: String, // 'user', 'canteen_owner', 'admin'
  ownedCanteen: ObjectId,
  isActive: Boolean,
  preferences: Object,
  lastLogin: Date
}
```

### Canteens Collection
```javascript
{
  name: String,
  description: String,
  address: String,
  building: String,
  isOpen: Boolean,
  operatingHours: Object,
  contact: Object,
  images: Array,
  rating: Object,
  owner: ObjectId,
  category: String,
  features: Array,
  isActive: Boolean
}
```

### Comments Collection
```javascript
{
  content: String,
  author: ObjectId,
  post: ObjectId,
  parent: ObjectId,
  depth: Number,
  isPinned: Boolean,
  likes: Array,
  dislikes: Array,
  isActive: Boolean,
  isDeleted: Boolean
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-production-db
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Deployment
```bash
# Build Docker image
docker build -t sliit-eats-backend .

# Run container
docker run -d -p 5000:5000 --env-file .env sliit-eats-backend
```

## 🔒 Security Features

- **JWT Tokens** with secure signing
- **HTTP-only Cookies** for refresh tokens
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **Helmet.js** security headers
- **Password Hashing** with bcrypt
- **Role-based Access Control**

## 📊 Monitoring & Logging

- **Morgan** for HTTP request logging
- **Custom Error Handling** with detailed logging
- **Socket.IO Connection Logging**
- **Performance Monitoring** ready for APM integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for SLIIT students and staff**
