import { updateUserRestriction, getFlaggedAccounts } from './moderationController';
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { registerUser, loginUser } from './authController';
import { getDatabase } from './db';

const app = express();
app.use(cors());
app.use(express.json()); // Allows parsing JSON data out of incoming requests

// -------------------------------------------------------------
// 🔑 CORE AUTHENTICATION ENDPOINTS (For RegisterLogin.tsx)
// -------------------------------------------------------------
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// -------------------------------------------------------------
// 🎥 ADDITIONAL ROUTE TEMPLATES (For Homepage.tsx Feed)
// -------------------------------------------------------------
app.get('/api/posts', async (req, res) => {
  try {
    const db = await getDatabase();
    // Pulls all creator feed posts order by newest entry down
    const posts = await db.all(`
      SELECT p.*, u.username, u.profile_picture_url 
      FROM posts p 
      JOIN users u ON p.user_id = u.user_id 
      ORDER BY p.post_id DESC
    `);
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch homepage feed items." });
  }
});

// -------------------------------------------------------------
// 💬 REAL-TIME CHET WEBSOCKET MATRIX ENGINE
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

    // Log tracking elements inside messages table
    const result = await db.run(
      `INSERT INTO messages (conversation_id, sender_id, message_type, file_url, is_view_once) 
       VALUES (?, ?, ?, ?, ?)`,
      [1, data.senderId, data.type, data.content, data.isViewOnce ? 1 : 0]
    );

    if (recipientSocketId) {
      // Direct Live Delivery (Two Grey Ticks)
      io.to(recipientSocketId).emit('receive_message', { ...data, dbId: result.lastID, status: 'delivered' });
      socket.emit('message_status_update', { messageId: data.messageId, status: 'delivered' });
    } else {
      // Recipient Offline (One Grey Tick)
      socket.emit('message_status_update', { messageId: data.messageId, status: 'sent' });
    }
  });

  socket.on('message_read', async (data: { messageId: string; senderId: string; isViewOnce: boolean; dbId?: number }) => {
    const senderSocketId = onlineUsers.get(data.senderId);
    
    if (senderSocketId) {
      io.to(senderSocketId).emit('message_status_update', { messageId: data.messageId, status: 'read' }); // Blue Tick
    }

    if (data.isViewOnce && data.dbId) {
      const db = await getDatabase();
      // Permanently remove assets data context to execute View Once parameters cleanly
      await db.run('UPDATE messages SET file_url = NULL, is_opened = 1 WHERE message_id = ?', [data.dbId]);
      io.emit('destroy_view_once_media', { messageId: data.messageId });
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
  });
});

const PORT = 5000;
httpServer.listen(PORT, () => console.log(`🚀 Creator engine server responding live on port ${PORT}`));
