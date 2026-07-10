import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

import { registerUser, loginUser } from './authController';
import { updateUserRestriction, getFlaggedAccounts } from './moderationController';
import {
  likePost,
  commentPost,
  getComments
} from './interactionsController';

const app = express();

// SUPABASE CLIENT
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!; // use service key on backend
export const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT'] }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// AUTH
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// USERS
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, username, is_online, work_status');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PROFILE
app.get('/api/users/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/users/:id', async (req, res) => {
  const { work_status, relationship_status } = req.body;
  const { error } = await supabase
    .from('users')
    .update({ work_status, relationship_status })
    .eq('user_id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// POSTS
app.get('/api/posts', async (req, res) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, users(username)`)
    .order('post_id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/posts', async (req, res) => {
  const { userId, content, mediaUrl } = req.body;
  if (!userId || !content) {
    return res.status(400).json({ error: "Missing data" });
  }

  const { data, error } = await supabase
    .from('posts')
    .insert([{ 
      user_id: userId, 
      content, 
      media_url: mediaUrl || null, 
      is_admin_featured: 0 
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, postId: data.post_id });
});

// POST INTERACTIONS
app.post('/api/posts/:postId/like', likePost);
app.post('/api/posts/:postId/comment', commentPost);
app.get('/api/posts/:postId/comments', getComments);

// ADMIN
app.post('/api/admin/restrict', updateUserRestriction);
app.get('/api/admin/flagged', getFlaggedAccounts);

// ROOT
app.get('/', (req, res) => {
  res.json({ status: 'alive' });
});

// SERVER
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.set('io', io);
const onlineUsers = new Map<string, string>();

io.on('connection', (socket: Socket) => {
  socket.on('disconnect', async () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        await supabase.from('users').update({ is_online: 0 }).eq('user_id', userId);
      }
    }
  });
});

const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);