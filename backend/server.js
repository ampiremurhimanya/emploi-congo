const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded CVs as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== ROUTES =====
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/student',       require('./routes/student'));
app.use('/api/company',       require('./routes/company'));
app.use('/api/admin',         require('./routes/admin'));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EmploiCongo API is running',
    timestamp: new Date().toISOString()
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  EmploiCongo API Server');
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV}`);
  console.log('========================================');
  console.log('');
});