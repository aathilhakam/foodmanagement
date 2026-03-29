# Frontend Integration Guide

This guide will help you integrate the existing React frontend with the new MERN backend API.

## 🔧 Required Dependencies

Install these additional packages for the frontend:

```bash
npm install socket.io-client axios react-router-dom @reduxjs/toolkit react-redux
```

## 📁 Updated File Structure

```
src/
├── api/
│   ├── auth.js
│   ├── canteen.js
│   ├── comment.js
│   └── socket.js
├── contexts/
│   ├── AuthContext.jsx
│   ├── SocketContext.jsx
│   └── RealtimeContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useSocket.js
│   └── useRealtime.js
├── services/
│   ├── apiService.js
│   └── authService.js
└── utils/
    ├── constants.js
    └── helpers.js
```

## 🔗 API Configuration

### `src/api/apiService.js`

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            withCredentials: true
          });
          
          const { token } = response.data.data;
          localStorage.setItem('token', token);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## 🔐 Authentication Integration

### `src/services/authService.js`

```javascript
import api from './apiService';

export const authService = {
  // Get current user
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  // Refresh token
  refreshToken: async () => {
    return await api.post('/auth/refresh');
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    return await api.put('/auth/profile', userData);
  },

  // Google OAuth URL
  getGoogleAuthUrl: () => {
    return `${api.defaults.baseURL}/auth/google`;
  },

  // Handle Google OAuth callback
  handleGoogleCallback: async (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }
};
```

### `src/contexts/AuthContext.jsx`

```javascript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
          
          // Verify token with backend
          await authService.getCurrentUser();
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 🔄 Real-time Integration

### `src/api/socket.js`

```javascript
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.connected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinPost(postId) {
    if (this.socket && this.connected) {
      this.socket.emit('joinPost', postId);
    }
  }

  leavePost(postId) {
    if (this.socket && this.connected) {
      this.socket.emit('leavePost', postId);
    }
  }

  joinCanteen(canteenId) {
    if (this.socket && this.connected) {
      this.socket.emit('joinCanteen', canteenId);
    }
  }

  onCanteenStatusChange(callback) {
    if (this.socket) {
      this.socket.on('canteenStatusChanged', callback);
    }
  }

  onCommentCreated(callback) {
    if (this.socket) {
      this.socket.on('commentCreated', callback);
    }
  }

  onCommentUpdated(callback) {
    if (this.socket) {
      this.socket.on('commentUpdated', callback);
    }
  }

  onCommentDeleted(callback) {
    if (this.socket) {
      this.socket.on('commentDeleted', callback);
    }
  }

  onCommentReaction(callback) {
    if (this.socket) {
      this.socket.on('commentReaction', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('userStoppedTyping', callback);
    }
  }

  emitStartTyping(postId) {
    if (this.socket && this.connected) {
      this.socket.emit('startTyping', { postId });
    }
  }

  emitStopTyping(postId) {
    if (this.socket && this.connected) {
      this.socket.emit('stopTyping', { postId });
    }
  }
}

export default new SocketService();
```

### `src/contexts/SocketContext.jsx`

```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../api/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket
      socketService.connect(token);
      setIsConnected(true);

      // Cleanup on unmount
      return () => {
        socketService.disconnect();
        setIsConnected(false);
      };
    } else {
      // Disconnect if not authenticated
      socketService.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated, token]);

  const value = {
    isConnected,
    socket: socketService
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
```

## 🏪 Canteen API Integration

### `src/api/canteen.js`

```javascript
import api from './apiService';

export const canteenService = {
  // Get all canteens
  getAllCanteens: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await api.get(`/canteens?${queryParams}`);
  },

  // Get single canteen
  getCanteen: async (id) => {
    return await api.get(`/canteens/${id}`);
  },

  // Create canteen
  createCanteen: async (canteenData) => {
    return await api.post('/canteens', canteenData);
  },

  // Update canteen
  updateCanteen: async (id, canteenData) => {
    return await api.put(`/canteens/${id}`, canteenData);
  },

  // Toggle canteen status
  toggleCanteenStatus: async (id, isOpen) => {
    return await api.patch(`/canteens/${id}/status`, { isOpen });
  },

  // Delete canteen
  deleteCanteen: async (id) => {
    return await api.delete(`/canteens/${id}`);
  },

  // Get canteen statistics
  getCanteenStats: async (id) => {
    return await api.get(`/canteens/${id}/stats`);
  },

  // Get my owned canteen
  getMyCanteen: async () => {
    return await api.get('/canteens/my/canteen');
  },

  // Search canteens
  searchCanteens: async (query, limit = 10) => {
    return await api.get(`/canteens/search/${query}?limit=${limit}`);
  },

  // Get canteen categories
  getCanteenCategories: async () => {
    return await api.get('/canteens/categories/list');
  }
};
```

## 💬 Comment API Integration

### `src/api/comment.js`

```javascript
import api from './apiService';

export const commentService = {
  // Get comments for a post
  getPostComments: async (postId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await api.get(`/comments/post/${postId}?${queryParams}`);
  },

  // Get comment replies
  getCommentReplies: async (commentId) => {
    return await api.get(`/comments/${commentId}/replies`);
  },

  // Create comment
  createComment: async (commentData) => {
    return await api.post('/comments', commentData);
  },

  // Update comment
  updateComment: async (commentId, content) => {
    return await api.put(`/comments/${commentId}`, { content });
  },

  // Delete comment
  deleteComment: async (commentId) => {
    return await api.delete(`/comments/${commentId}`);
  },

  // Pin/unpin comment
  pinComment: async (commentId, isPinned) => {
    return await api.patch(`/comments/${commentId}/pin`, { isPinned });
  },

  // Add reaction to comment
  addReaction: async (commentId, reaction) => {
    return await api.post(`/comments/${commentId}/react`, { reaction });
  },

  // Remove reaction from comment
  removeReaction: async (commentId) => {
    return await api.delete(`/comments/${commentId}/react`);
  },

  // Get user's comments
  getUserComments: async (userId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await api.get(`/comments/user/${userId}?${queryParams}`);
  },

  // Get comment statistics
  getCommentStats: async (postId) => {
    return await api.get(`/comments/stats/post/${postId}`);
  }
};
```

## 🔄 Real-time Context

### `src/contexts/RealtimeContext.jsx`

```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { canteenService } from '../api/canteen';
import { commentService } from '../api/comment';

const RealtimeContext = createContext();

export const RealtimeProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const [canteenStatuses, setCanteenStatuses] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (!isConnected || !socket) return;

    // Canteen status updates
    socket.onCanteenStatusChange((data) => {
      setCanteenStatuses(prev => ({
        ...prev,
        [data.canteenId]: {
          isOpen: data.isOpen,
          lastUpdate: data.timestamp
        }
      }));
    });

    // Comment events
    socket.onCommentCreated((data) => {
      // Handle new comment creation
      console.log('New comment created:', data);
    });

    socket.onCommentUpdated((data) => {
      // Handle comment update
      console.log('Comment updated:', data);
    });

    socket.onCommentDeleted((data) => {
      // Handle comment deletion
      console.log('Comment deleted:', data);
    });

    socket.onCommentReaction((data) => {
      // Handle comment reaction
      console.log('Comment reaction:', data);
    });

    // Typing indicators
    socket.onUserTyping((data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.postId]: {
          ...prev[data.postId],
          [data.userId]: {
            userName: data.userName,
            timestamp: Date.now()
          }
        }
      }));
    });

    socket.onUserStoppedTyping((data) => {
      setTypingUsers(prev => {
        const postTyping = prev[data.postId] || {};
        delete postTyping[data.userId];
        return {
          ...prev,
          [data.postId]: postTyping
        };
      });
    });

    return () => {
      // Cleanup listeners
      socket.offCanteenStatusChange();
      socket.offCommentCreated();
      socket.offCommentUpdated();
      socket.offCommentDeleted();
      socket.offCommentReaction();
      socket.offUserTyping();
      socket.offUserStoppedTyping();
    };
  }, [isConnected, socket]);

  const joinPostRoom = (postId) => {
    if (socket && isConnected) {
      socket.joinPost(postId);
    }
  };

  const leavePostRoom = (postId) => {
    if (socket && isConnected) {
      socket.leavePost(postId);
    }
  };

  const joinCanteenRoom = (canteenId) => {
    if (socket && isConnected) {
      socket.joinCanteen(canteenId);
    }
  };

  const startTyping = (postId) => {
    if (socket && isConnected) {
      socket.emitStartTyping(postId);
    }
  };

  const stopTyping = (postId) => {
    if (socket && isConnected) {
      socket.emitStopTyping(postId);
    }
  };

  const getCanteenStatus = (canteenId) => {
    return canteenStatuses[canteenId]?.isOpen;
  };

  const getTypingUsers = (postId) => {
    const postTyping = typingUsers[postId] || {};
    return Object.values(postTyping).filter(
      user => Date.now() - user.timestamp < 5000 // Remove users who stopped typing for 5 seconds
    );
  };

  const value = {
    isConnected,
    canteenStatuses,
    typingUsers,
    joinPostRoom,
    leavePostRoom,
    joinCanteenRoom,
    startTyping,
    stopTyping,
    getCanteenStatus,
    getTypingUsers
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
```

## 🚀 Updated App.jsx

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { RealtimeProvider } from './contexts/RealtimeContext';

// Import your existing components
import Index from './pages/Index';
import Login from './pages/Login';
import ShopDetail from './pages/ShopDetail';
import BlogFeed from './pages/BlogFeed';
import ShopAdminDashboard from './pages/ShopAdminDashboard';
import PostManagement from './pages/PostManagement';
import CommentManagement from './pages/CommentManagement';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <RealtimeProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/shop/:id" element={<ShopDetail />} />
                <Route path="/blog" element={<BlogFeed />} />
                <Route path="/dashboard" element={<ShopAdminDashboard />} />
                <Route path="/dashboard/posts" element={<PostManagement />} />
                <Route path="/dashboard/comments" element={<CommentManagement />} />
              </Routes>
            </Router>
          </RealtimeProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

## 🔧 Environment Variables

Create a `.env` file in the frontend root:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🧪 Testing the Integration

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend**
   ```bash
   cd frontend
   npm start
   ```

3. **Test Google OAuth**
   - Navigate to `/login`
   - Click "Login with Google"
   - Complete OAuth flow
   - Verify user is logged in

4. **Test real-time features**
   - Open two browser windows
   - Toggle canteen status in admin dashboard
   - Verify status updates in real-time on main page

5. **Test comment system**
   - Add comments to blog posts
   - Test like/dislike functionality
   - Verify real-time updates

## 📝 Migration Checklist

- [ ] Install new dependencies
- [ ] Set up API service layer
- [ ] Implement authentication context
- [ ] Add Socket.IO integration
- [ ] Update existing components to use new APIs
- [ ] Test real-time features
- [ ] Verify role-based access control
- [ ] Test Google OAuth flow

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured correctly
   - Check frontend API URL environment variable

2. **Socket Connection Issues**
   - Verify JWT token is valid
   - Check Socket.IO server is running
   - Ensure correct Socket.IO URL

3. **Authentication Issues**
   - Check JWT secrets match between frontend and backend
   - Verify Google OAuth configuration
   - Clear localStorage if token issues persist

4. **Real-time Updates Not Working**
   - Ensure Socket.IO connection is established
   - Check room joining logic
   - Verify event listeners are properly set up

This integration guide provides a complete roadmap for connecting your existing React frontend with the new MERN backend API while maintaining all the existing functionality and adding powerful new features.
