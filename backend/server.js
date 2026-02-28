require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const connectDB      = require('./config/database');
const authRoutes     = require('./routes/auth');
const recordRoutes   = require('./routes/records');
const claimRoutes    = require('./routes/claims');
const hospitalRoutes = require('./routes/hospitals');
const aiRoutes       = require('./routes/ai');
const errorHandler   = require('./middlewares/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/auth',      authRoutes);
app.use('/api/records',   recordRoutes);
app.use('/api/claims',    claimRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/ai',        aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 HealthChain running at http://localhost:${PORT}`);
  console.log(`   Frontend : http://localhost:${PORT}`);
  console.log(`   API      : http://localhost:${PORT}/api\n`);
});

module.exports = app;