const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

const pool = require('./db/connection');
const eventTypesRoutes = require('./routes/eventTypes');
const availabilityRoutes = require('./routes/availability');
const bookingsRoutes = require('./routes/bookings');
const meetingsRoutes = require('./routes/meetings');

app.get('/api/users/:username', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, username, email, timezone FROM users WHERE username = ?', [req.params.username]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch user' }); }
});

app.get('/api/users/:username/event-types', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT et.id, et.name, et.slug, et.duration, et.description, et.location, et.color FROM event_types et JOIN users u ON et.user_id = u.id WHERE u.username = ? AND et.is_active = 1 ORDER BY et.duration ASC',
      [req.params.username]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch event types' }); }
});

app.use('/api/event-types', eventTypesRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/meetings', meetingsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, '0.0.0.0' => {
  console.log(`\n🚀 Calendly Clone API running on http://localhost:${PORT}\n`);
});
