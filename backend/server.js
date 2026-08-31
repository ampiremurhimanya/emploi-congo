const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/student',       require('./routes/student'));
app.use('/api/company',       require('./routes/company'));
app.use('/api/admin',         require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EmploiCongo API is running',
    timestamp: new Date().toISOString(),
    mail: process.env.MAIL_ENABLED === 'true' ? 'enabled' : 'disabled'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée.' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  EmploiCongo API Server');
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV}`);
  console.log(`  Mail: ${process.env.MAIL_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
  console.log('========================================');
  console.log('');
});