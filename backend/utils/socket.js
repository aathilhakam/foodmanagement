const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket.IO authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('Invalid user'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

// Initialize Socket.IO
const initializeSocketIO = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected (${socket.user._id})`);

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Join canteen owner to their canteen room
    if (socket.user.role === 'canteen_owner' && socket.user.ownedCanteen) {
      socket.join(`canteen_${socket.user.ownedCanteen}`);
    }

    // Join admin to admin room
    if (socket.user.role === 'admin') {
      socket.join('admin_room');
    }

    // Handle joining post-specific rooms
    socket.on('joinPost', (postId) => {
      socket.join(`post_${postId}`);
      console.log(`User ${socket.user.name} joined post ${postId}`);
    });

    // Handle leaving post-specific rooms
    socket.on('leavePost', (postId) => {
      socket.leave(`post_${postId}`);
      console.log(`User ${socket.user.name} left post ${postId}`);
    });

    // Handle joining canteen-specific rooms
    socket.on('joinCanteen', (canteenId) => {
      socket.join(`canteen_${canteenId}`);
      console.log(`User ${socket.user.name} joined canteen ${canteenId}`);
    });

    // Handle real-time canteen status updates
    socket.on('canteenStatusUpdate', async (data) => {
      try {
        const { canteenId, isOpen } = data;
        
        // Verify user owns the canteen or is admin
        if (socket.user.role === 'canteen_owner') {
          const Canteen = require('../models/Canteen');
          const canteen = await Canteen.findOne({ 
            _id: canteenId, 
            owner: socket.user._id 
          });
          
          if (!canteen) {
            socket.emit('error', { message: 'Canteen not found or not owned' });
            return;
          }
        } else if (socket.user.role !== 'admin') {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Broadcast status change to all clients
        io.emit('canteenStatusChanged', {
          canteenId,
          isOpen,
          updatedBy: socket.user._id,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Canteen status update error:', error);
        socket.emit('error', { message: 'Failed to update canteen status' });
      }
    });

    // Handle typing indicators for comments
    socket.on('startTyping', (data) => {
      const { postId } = data;
      socket.to(`post_${postId}`).emit('userTyping', {
        userId: socket.user._id,
        userName: socket.user.name,
        postId
      });
    });

    socket.on('stopTyping', (data) => {
      const { postId } = data;
      socket.to(`post_${postId}`).emit('userStoppedTyping', {
        userId: socket.user._id,
        postId
      });
    });

    // Handle real-time notifications
    socket.on('markNotificationRead', (notificationId) => {
      // In a real implementation, you would mark the notification as read in the database
      socket.emit('notificationMarkedRead', { notificationId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected (${socket.user._id})`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user.name}:`, error);
    });
  });

  // Global error handling
  io.on('error', (error) => {
    console.error('Socket.IO error:', error);
  });

  console.log('Socket.IO server initialized');
};

// Helper functions for broadcasting
const broadcastToRoom = (io, room, event, data) => {
  io.to(room).emit(event, data);
};

const broadcastToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

const broadcastToAdmins = (io, event, data) => {
  io.to('admin_room').emit(event, data);
};

const broadcastToCanteenOwner = (io, canteenId, event, data) => {
  io.to(`canteen_${canteenId}`).emit(event, data);
};

const broadcastToPostFollowers = (io, postId, event, data) => {
  io.to(`post_${postId}`).emit(event, data);
};

// Real-time event emitters
const emitCanteenStatusChange = (io, canteenId, isOpen, updatedBy) => {
  io.emit('canteenStatusChanged', {
    canteenId,
    isOpen,
    updatedBy,
    timestamp: new Date()
  });
};

const emitCommentCreated = (io, comment, postId, parentId = null) => {
  const eventData = {
    comment,
    postId,
    parentId,
    timestamp: new Date()
  };

  // Broadcast to post followers
  broadcastToPostFollowers(io, postId, 'commentCreated', eventData);

  // If it's a reply, notify parent comment author
  if (parentId) {
    // In a real implementation, you'd get the parent comment author and notify them
    broadcastToRoom(io, `post_${postId}`, 'replyCreated', eventData);
  }
};

const emitCommentUpdated = (io, comment, editedBy) => {
  broadcastToPostFollowers(io, comment.post, 'commentUpdated', {
    comment,
    editedBy,
    timestamp: new Date()
  });
};

const emitCommentDeleted = (io, commentId, postId, deletedBy) => {
  broadcastToPostFollowers(io, postId, 'commentDeleted', {
    commentId,
    postId,
    deletedBy,
    timestamp: new Date()
  });
};

const emitCommentReaction = (io, commentId, postId, userId, reaction, counts) => {
  broadcastToPostFollowers(io, postId, 'commentReaction', {
    commentId,
    userId,
    reaction,
    counts,
    timestamp: new Date()
  });
};

const emitCommentPinned = (io, comment, isPinned, pinnedBy) => {
  broadcastToPostFollowers(io, comment.post, 'commentPinned', {
    comment,
    isPinned,
    pinnedBy,
    timestamp: new Date()
  });
};

const emitPostCreated = (io, post) => {
  // Notify canteen followers
  if (post.canteen) {
    broadcastToCanteenOwner(io, post.canteen, 'postCreated', {
      post,
      timestamp: new Date()
    });
  }

  // Broadcast to general feed (if applicable)
  io.emit('newPost', {
    post,
    timestamp: new Date()
  });
};

const emitUserNotification = (io, userId, notification) => {
  broadcastToUser(io, userId, 'notification', {
    ...notification,
    timestamp: new Date()
  });
};

module.exports = {
  initializeSocketIO,
  broadcastToRoom,
  broadcastToUser,
  broadcastToAdmins,
  broadcastToCanteenOwner,
  broadcastToPostFollowers,
  emitCanteenStatusChange,
  emitCommentCreated,
  emitCommentUpdated,
  emitCommentDeleted,
  emitCommentReaction,
  emitCommentPinned,
  emitPostCreated,
  emitUserNotification
};
