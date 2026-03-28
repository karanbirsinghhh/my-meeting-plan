const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const { type = 'upcoming' } = req.query;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let query;
    if (type === 'upcoming') {
      query = `SELECT b.*, et.name as event_name, et.duration, et.location, et.color, u.name as host_name FROM bookings b JOIN event_types et ON b.event_type_id = et.id JOIN users u ON et.user_id = u.id WHERE et.user_id = 1 AND b.start_time >= ? AND b.status = 'confirmed' ORDER BY b.start_time ASC`;
    } else {
      query = `SELECT b.*, et.name as event_name, et.duration, et.location, et.color, u.name as host_name FROM bookings b JOIN event_types et ON b.event_type_id = et.id JOIN users u ON et.user_id = u.id WHERE et.user_id = 1 AND (b.start_time < ? OR b.status = 'cancelled') ORDER BY b.start_time DESC`;
    }
    const [rows] = await pool.query(query, [now]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch meetings' }); }
});

router.put('/:id/cancel', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT b.* FROM bookings b JOIN event_types et ON b.event_type_id = et.id WHERE b.id = ? AND et.user_id = 1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Meeting not found' });
    if (existing[0].status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' });
    await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    const [updated] = await pool.query(
      'SELECT b.*, et.name as event_name, et.duration, et.location, et.color, u.name as host_name FROM bookings b JOIN event_types et ON b.event_type_id = et.id JOIN users u ON et.user_id = u.id WHERE b.id = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to cancel meeting' }); }
});

module.exports = router;
