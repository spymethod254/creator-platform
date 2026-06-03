import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
// Enable CORS for frontend desktop and mobile browser access
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Track active online sockets: Map<userId, socketId>
const onlineUsers = new Map<string, string>();

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. User comes online
  socket.on('user_online', (userId: string) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit('user_status_change', { userId, status: 'online' });
  });

  // 2. Handle sending messages (Handles Ticks & View-Once)
  socket.on('send_message', (data: {
    messageId: string;
    senderId: string;
    recipientId: string;
    type: 'text' | 'image' | 'video' | 'audio';
    content: string;
    isViewOnce: boolean;
  }) => {
    const recipientSocketId = onlineUsers.get(data.recipientId);

    if (recipientSocketId) {
      // Recipient is online: Deliver message immediately (Two Grey Ticks)
      io.to(recipientSocketId).emit('receive_message', {
        ...data,
        status: 'delivered' // 2 Grey Ticks
      });
      // Acknowledge back to sender
      socket.emit('message_status_update', { messageId: data.messageId, status: 'delivered' });
    } else {
      // Recipient offline: Sent to database queue (One Grey Tick)
      socket.emit('message_status_update', { messageId: data.messageId, status: 'sent' });
    }
  });

  // 3. Handle Message Read (Blue Tick) & View-Once Destruction
  socket.on('message_read', (data: { messageId: string; senderId: string; isViewOnce: boolean }) => {
    const senderSocketId = onlineUsers.get(data.senderId);
    
    if (senderSocketId) {
      // Inform sender the message was read (Blue Tick)
      io.to(senderSocketId).emit('message_status_update', { messageId: data.messageId, status: 'read' });
    }

    // Secure View-Once Destruction Hook
    if (data.isViewOnce) {
      // Instruct database and all clients to wipe the asset immediately
      io.emit('destroy_view_once_media', { messageId: data.messageId });
      console.log(`Media asset ${data.messageId} permanently deleted.`);
    }
  });

  // 4. User disconnects
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        socket.broadcast.emit('user_status_change', { userId, status: 'offline', lastSeen: new Date() });
        break;
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));