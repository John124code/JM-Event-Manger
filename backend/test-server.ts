import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Simple CORS configuration
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test auth route
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint working',
    body: req.body
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});