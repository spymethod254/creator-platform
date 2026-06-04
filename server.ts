import { toggleLike, addComment, getPostEngagement, toggleFollow, getFollowStats } from './interactionsController';
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { registerUser, loginUser } from './authController';
import { updateUserRestriction, getFlaggedAccounts } from './moderationController';
import { getDatabase } from './db';

const app = express();
app.use(cors());
app.use(express.json()); 

// -------------------------------------------------------------
// 🔑 CORE AUTHENTICATION ENDPOINTS 
// -------------------------------------------------------------
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// -------------------------------------------------------------
// 🛡️ ADMIN MODERATION CONTROL ENDPOINTS 
// -------------------------------------------------------------
app.post('/api/admin/restrict', updateUserRestriction);
app.get('/api/admin/flagged', getFlaggedAccounts);

// -------------------------------------------------------------
// 💬 INTERACTION & FOLLOWER MATRIX API ROUTE MAPPINGS
// -------------------------------------------------------------
app.post('/api/posts/like', toggleLike);
app.post('/api/posts/comment', addComment);
app.get('/api/posts/:postId/engagement', getPostEngagement);

app.post('/api/creators/follow', toggleFollow);
app.get('/api/creators/:userId/follow-stats', getFollowStats);

// -------------------------------------------------------------
// 📝 HOMEPAGE SCROLL FEED ENDPOINTS 
// -------------------------------------------------------------
app.get('/api/posts', async (req, res) => {
  try {
    const db = await getDatabase();
    const posts = await db.all(`
      SELECT p.*, u.username, u.profile_picture_url 
      FROM posts p 
      JOIN users u ON p.user_id = u.user_id 
      ORDER BY p.post_id DESC
    `);
    return res.json(posts);
  } catch (error) {
    console.error("Fetch Feed Error:", error);
    return res.status(500).json({ error: "Failed to fetch homepage feed items." });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { userId, content, mediaUrl } = req.body;
    if (!userId || !content.trim()) {
      return res.status(400).json({ error: "User ID and post content parameters are required." });
    }

    const db = await getDatabase();
    const user = await db.get('SELECT restriction_status FROM users WHERE user_id = ?', [userId]);
    
    if (!user) {
      return res.status(404).json({ error: "Creator profile record not found." });
    }
    if (user.restriction_status === 'Banned' || user.restriction_status === 'Restricted') {
      return res.status(403).json({ error: "Your account is restricted from publishing update feeds." });
    }

    const result = await db.run(
      `INSERT INTO posts (user_id, content, media_url, is_admin_featured) VALUES (?, ?, ?, 0)`,
      [userId, content, mediaUrl || null]
    );

    return res.status(201).json({
      success: true,
      message: "Post successfully published to creator network feed!",
      postId: result.lastID
    });
  } catch (error) {
    console.error("Feed Post Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// -------------------------------------------------------------
// 💬 REAL-TIME CHAT WEBSOCKET ENGINE (Optimized & Cleaned)
// -------------------------------------------------------------
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const onlineUsers = new Map<string, string>(); // Map<userId, socketId>

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('user_online', async (userId: string) => {
    onlineUsers.set(userId, socket.id);
    const db = await getDatabase();
    await db.run('UPDATE users SET is_online = 1 WHERE user_id = ?', [userId]);
    socket.broadcast.emit('user_status_change', { userId, status: 'online' });
  });

  socket.on('send_message', async (data: {
    messageId: string; senderId: string; recipientId: string;
    type: 'text' | 'image' | 'video' | 'audio'; content: string; isViewOnce: boolean;
  }) => {
    const recipientSocketId = onlineUsers.get(data.recipientId);
    const db = await getDatabase();

    const result = await db.run(
      `INSERT INTO messages (conversation_id, sender_id, message_type, file_url, is_view_once) 
       VALUES (?, ?, ?, ?, ?)`,
      [1, data.senderId, data.type, data.content, data.isViewOnce ? 1 : 0]
    );

    if (recipientSocketId) {
      // ✅ FIX 2: Added explicit delivery state tracking data payload for receiver
      io.to(recipientSocketId).emit('receive_message', { 
        ...data, 
        dbId: result.lastID, 
        status: 'delivered' 
      });
      socket.emit('message_status_update', { messageId: data.messageId, status: 'delivered' });
    } else {
      socket.emit('message_status_update', { messageId: data.messageId, status: 'sent' });
    }
  });

  socket.on('message_read', async (data: { messageId: string; senderId: string; recipientId: string; isViewOnce: boolean; dbId?: number }) => {
    const senderSocketId = onlineUsers.get(data.senderId);
    const recipientSocketId = onlineUsers.get(data.recipientId);

    // Alert the sender that their message has been read (triggers double blue ticks)
    if (senderSocketId) {
      io.to(senderSocketId).emit('message_status_update', { messageId: data.messageId, status: 'read' });
    }

    // ✅ FIX 1 & 3: Scrub item from DB and target ONLY the active chat participants for visual destruction
    if (data.isViewOnce && data.dbId) {
      const db = await getDatabase();
      // Safe dynamic table schema check update execution
      await db.run('UPDATE messages SET file_url = NULL, is_opened = 1 WHERE id = ? OR message_id = ?', [data.dbId, data.dbId]);
      
      // Target destruction updates only to the sender and recipient, not global broadcast
      if (senderSocketId) io.to(senderSocketId).emit('destroy_view_once_media', { messageId: data.messageId });
      if (recipientSocketId) io.to(recipientSocketId).emit('destroy_view_once_media', { messageId: data.messageId });
      
      console.log(`🔒 View-Once asset ${data.messageId} successfully destroyed from memory.`);
    }
  });

  socket.on('disconnect', async () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        const db = await getDatabase();
        await db.run('UPDATE users SET is_online = 0, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?', [userId]);
        socket.broadcast.emit('user_status_change', { userId, status: 'offline', lastSeen: new Date() });
        break;
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 5000;
httpServer.listen(PORT, () => console.log(`🚀 Creator engine server responding live on port ${PORT}`));
