import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import cors from 'cors';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars-long!!'; // Must be 32 chars
const IV_LENGTH = 16;

function encrypt(text: string): string {
  // Ensure key is 32 bytes
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

// Database Setup
const db = new Database('pixel_dashboard.db');
db.pragma('journal_mode = WAL');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS websites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    destination_url TEXT NOT NULL,
    pixel_id TEXT NOT NULL,
    access_token TEXT,
    event_type TEXT DEFAULT 'PageView',
    tracking_mode TEXT DEFAULT 'auto',
    cta_config TEXT,
    status TEXT DEFAULT 'active',
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Middleware: Authenticate User
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- AUTH ROUTES ---

  // Register
  app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = nanoid(10);
      
      const stmt = db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)');
      stmt.run(id, email, hashedPassword);

      const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '24h' });
      
      res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' }); // Secure false for dev
      res.json({ success: true, user: { id, email } });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      console.error(error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email) as any;

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      
      res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
      res.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Get Current User
  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Forgot Password (Mock Email)
  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as any;

    if (user) {
      const resetToken = nanoid(32);
      const expires = Date.now() + 3600000; // 1 hour

      db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
        .run(resetToken, expires, user.id);

      // In a real app, send email here. For dev, return the link.
      console.log(`[DEV] Password Reset Link: http://localhost:3000/reset-password?token=${resetToken}`);
      return res.json({ success: true, message: 'Reset link sent (check console for dev link)', devLink: `/reset-password?token=${resetToken}` });
    }

    // Always return success to prevent email enumeration
    res.json({ success: true, message: 'If that email exists, we sent a reset link.' });
  });

  // Reset Password
  app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    
    const stmt = db.prepare('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?');
    const user = stmt.get(token, Date.now()) as any;

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
      .run(hashedPassword, user.id);

    res.json({ success: true });
  });

  // --- WEBSITE ROUTES (PROTECTED) ---

  // Get all websites (User specific)
  app.get('/api/websites', authenticateToken, (req: any, res) => {
    const stmt = db.prepare('SELECT * FROM websites WHERE user_id = ? ORDER BY created_at DESC');
    const websites = stmt.all(req.user.id);
    res.json(websites);
  });

  // Get single website (Public for tracking, Protected for editing check logic in frontend/backend if needed)
  // Note: Tracking page is public, so we don't use authenticateToken for the public GET
  app.get('/api/websites/:id', (req, res) => {
    const stmt = db.prepare('SELECT * FROM websites WHERE id = ?');
    const website = stmt.get(req.params.id);
    if (website) {
      res.json(website);
    } else {
      res.status(404).json({ error: 'Website not found' });
    }
  });

  // Create website
  app.post('/api/websites', authenticateToken, (req: any, res) => {
    const { name, destination_url, pixel_id, access_token, event_type, tracking_mode, cta_config } = req.body;
    const id = nanoid(10);
    
    try {
      const encryptedToken = access_token ? encrypt(access_token) : null;
      const stmt = db.prepare(`
        INSERT INTO websites (id, user_id, name, destination_url, pixel_id, access_token, event_type, tracking_mode, cta_config)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, req.user.id, name, destination_url, pixel_id, encryptedToken, event_type, tracking_mode, JSON.stringify(cta_config || []));
      res.json({ id, success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create website' });
    }
  });

  // Update website
  app.put('/api/websites/:id', authenticateToken, (req: any, res) => {
    // ... existing update logic ...
  });

  // --- ACCESS TOKEN MANAGEMENT ---

  // Save/Update Access Token
  app.post('/api/websites/:id/token', authenticateToken, (req: any, res) => {
    const { token } = req.body;
    const { id } = req.params;

    if (!token) return res.status(400).json({ error: 'Token is required' });

    try {
      // Verify ownership
      const check = db.prepare('SELECT user_id FROM websites WHERE id = ?').get(id) as any;
      if (!check || check.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const encryptedToken = encrypt(token);
      db.prepare('UPDATE websites SET access_token = ? WHERE id = ?').run(encryptedToken, id);
      
      res.json({ success: true, message: 'Token saved securely' });
    } catch (error) {
      console.error('Token save error:', error);
      res.status(500).json({ error: 'Failed to save token' });
    }
  });

  // Get Token Status (Never returns full token)
  app.get('/api/websites/:id/token-status', authenticateToken, (req: any, res) => {
    const { id } = req.params;

    try {
      const check = db.prepare('SELECT user_id, access_token FROM websites WHERE id = ?').get(id) as any;
      if (!check || check.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (check.access_token) {
        try {
          const decrypted = decrypt(check.access_token);
          const last4 = decrypted.slice(-4);
          res.json({ hasToken: true, last4 });
        } catch (e) {
          // If decryption fails (e.g. key changed), treat as invalid
          res.json({ hasToken: false, error: 'Decryption failed' });
        }
      } else {
        res.json({ hasToken: false });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to check token status' });
    }
  });

  // Delete Access Token
  app.delete('/api/websites/:id/token', authenticateToken, (req: any, res) => {
    const { id } = req.params;

    try {
      const check = db.prepare('SELECT user_id FROM websites WHERE id = ?').get(id) as any;
      if (!check || check.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      db.prepare('UPDATE websites SET access_token = NULL WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete token' });
    }
  });

  // Send CAPI Event (Real or Simulated)
  app.post('/api/send-capi-event', authenticateToken, async (req: any, res) => {
    const { pixel_id, event_name, user_data, website_id } = req.body;

    if (!pixel_id || !event_name || !website_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // 1. Get the access token securely
      const website = db.prepare('SELECT access_token, user_id FROM websites WHERE id = ?').get(website_id) as any;
      
      if (!website || website.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      let accessToken = null;
      if (website.access_token) {
        try {
          accessToken = decrypt(website.access_token);
        } catch (e) {
          console.error('Token decryption failed');
        }
      }

      // 2. If no token, return error or fallback to simulation if allowed (but user wants "Use it for CAPI events")
      if (!accessToken) {
        return res.status(400).json({ error: 'Access Token not configured for this pixel.' });
      }

      // 3. Make Real Request to Meta Graph API
      // https://graph.facebook.com/{API_VERSION}/{PIXEL_ID}/events?access_token={TOKEN}
      const apiVersion = 'v19.0';
      const url = `https://graph.facebook.com/${apiVersion}/${pixel_id}/events?access_token=${accessToken}`;
      
      const payload = {
        data: [
          {
            event_name: event_name,
            event_time: Math.floor(Date.now() / 1000),
            user_data: {
              em: user_data?.email ? crypto.createHash('sha256').update(user_data.email).digest('hex') : undefined,
              // Add other user data hashing here if needed
              client_user_agent: req.headers['user-agent'],
              client_ip_address: req.ip
            },
            action_source: 'website'
          }
        ]
      };

      // We use fetch here (Node 18+ has native fetch)
      const metaResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const metaData = await metaResponse.json();

      if (!metaResponse.ok) {
        return res.status(metaResponse.status).json({ 
          success: false, 
          error: metaData.error?.message || 'Meta API Error',
          details: metaData.error
        });
      }

      res.json({ 
        success: true, 
        message: 'Event sent to Meta CAPI', 
        status: 'processed',
        event_id: metaData.fbtrace_id || nanoid(16)
      });

    } catch (error: any) {
      console.error('CAPI Error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  // Test CAPI Endpoint (Legacy Simulation - keep for backward compat or update)
  // ... existing test-capi ...

  // Delete website
  app.delete('/api/websites/:id', authenticateToken, (req: any, res) => {
    try {
      // Ensure user owns the website
      const check = db.prepare('SELECT user_id FROM websites WHERE id = ?').get(req.params.id) as any;
      if (!check || check.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const stmt = db.prepare('DELETE FROM websites WHERE id = ?');
      stmt.run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete website' });
    }
  });

  // Increment view count (Public)
  app.post('/api/websites/:id/track', (req, res) => {
    try {
      const stmt = db.prepare('UPDATE websites SET views = views + 1 WHERE id = ?');
      stmt.run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to track view' });
    }
  });

  // Test CAPI Endpoint (Simulation)
  app.post('/api/test-capi', authenticateToken, (req, res) => {
    const { pixel_id, event_name, user_data } = req.body;

    if (!pixel_id || !event_name) {
      return res.status(400).json({ error: 'Missing pixel_id or event_name' });
    }

    // Simulate processing delay
    setTimeout(() => {
      // Randomly simulate an edge error for demonstration if requested (optional)
      // For now, we just return success to simulate a valid CAPI hit.
      
      console.log(`[CAPI Simulation] Pixel: ${pixel_id}, Event: ${event_name}`, user_data);
      
      res.json({ 
        success: true, 
        message: 'Event received by server', 
        status: 'processed',
        event_id: nanoid(16)
      });
    }, 500);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
