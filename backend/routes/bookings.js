const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

router.get('/slots/:username/:slug', async (req, res) => {
  try {
    const { username, slug } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date parameter is required' });

    const [eventTypes] = await pool.query(
      `SELECT et.*, u.timezone, u.name as user_name, u.username FROM event_types et JOIN users u ON et.user_id = u.id WHERE u.username = ? AND et.slug = ? AND et.is_active = 1`, [username, slug]
    );
    if (!eventTypes.length) return res.status(404).json({ error: 'Event type not found' });

    const eventType = eventTypes[0];
    const requestedDate = new Date(date + 'T00:00:00');
    const dayOfWeek = requestedDate.getDay();

    const [availability] = await pool.query('SELECT * FROM availability WHERE user_id = ? AND day_of_week = ? AND is_active = 1', [eventType.user_id, dayOfWeek]);
    if (!availability.length) return res.json({ slots: [], eventType });

    const [userETs] = await pool.query('SELECT id FROM event_types WHERE user_id = ?', [eventType.user_id]);
    const etIds = userETs.map(e => e.id);
    const [existingBookings] = await pool.query(
      `SELECT start_time, end_time FROM bookings WHERE event_type_id IN (?) AND status = 'confirmed' AND DATE(start_time) = ?`, [etIds, date]
    );

    const slots = [];
    const duration = eventType.duration;
    for (const avail of availability) {
      const startParts = avail.start_time.split(':').map(Number);
      const endParts = avail.end_time.split(':').map(Number);
      let cur = new Date(requestedDate); cur.setHours(startParts[0], startParts[1], 0, 0);
      const endT = new Date(requestedDate); endT.setHours(endParts[0], endParts[1], 0, 0);

      while (cur.getTime() + duration * 60000 <= endT.getTime()) {
        const slotStart = new Date(cur);
        const slotEnd = new Date(cur.getTime() + duration * 60000);
        const conflict = existingBookings.some(b => {
          const bs = new Date(b.start_time), be = new Date(b.end_time);
          return slotStart < be && slotEnd > bs;
        });
        if (!conflict && slotStart > new Date()) {
          slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString(), display: slotStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) });
        }
        cur.setMinutes(cur.getMinutes() + duration);
      }
    }
    res.json({ slots, eventType });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch slots' }); }
});

router.get('/available-dates/:username/:slug', async (req, res) => {
  try {
    const { username, slug } = req.params;
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'Month parameter required' });

    const [eventTypes] = await pool.query(
      'SELECT et.*, u.timezone FROM event_types et JOIN users u ON et.user_id = u.id WHERE u.username = ? AND et.slug = ? AND et.is_active = 1', [username, slug]
    );
    if (!eventTypes.length) return res.status(404).json({ error: 'Event type not found' });

    const [avail] = await pool.query('SELECT day_of_week FROM availability WHERE user_id = ? AND is_active = 1', [eventTypes[0].user_id]);
    const activeDays = new Set(avail.map(a => a.day_of_week));

    const [year, mon] = month.split('-').map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const availableDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, mon - 1, day);
      if (d >= today && activeDays.has(d.getDay())) availableDates.push(d.toISOString().split('T')[0]);
    }
    res.json({ availableDates });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch available dates' }); }
});

router.post('/', async (req, res) => {
  try {
    const { event_type_id, invitee_name, invitee_email, start_time, end_time, timezone, notes } = req.body;
    if (!event_type_id || !invitee_name || !invitee_email || !start_time || !end_time)
      return res.status(400).json({ error: 'Missing required fields' });

    const [ets] = await pool.query('SELECT * FROM event_types WHERE id = ? AND is_active = 1', [event_type_id]);
    if (!ets.length) return res.status(404).json({ error: 'Event type not found' });

    const [userETs] = await pool.query('SELECT id FROM event_types WHERE user_id = ?', [ets[0].user_id]);
    const etIds = userETs.map(e => e.id);
    const [conflicts] = await pool.query(
      `SELECT id FROM bookings WHERE event_type_id IN (?) AND status = 'confirmed' AND start_time < ? AND end_time > ?`, [etIds, end_time, start_time]
    );
    if (conflicts.length) return res.status(409).json({ error: 'This time slot is no longer available' });

    const sf = new Date(start_time).toISOString().slice(0, 19).replace('T', ' ');
    const ef = new Date(end_time).toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await pool.query(
      'INSERT INTO bookings (event_type_id, invitee_name, invitee_email, start_time, end_time, timezone, notes) VALUES (?,?,?,?,?,?,?)',
      [event_type_id, invitee_name, invitee_email, sf, ef, timezone || 'Asia/Kolkata', notes || null]
    );
    const [booking] = await pool.query(
      'SELECT b.*, et.name as event_name, et.duration, et.location, u.name as host_name FROM bookings b JOIN event_types et ON b.event_type_id = et.id JOIN users u ON et.user_id = u.id WHERE b.id = ?',
      [result.insertId]
    );
    res.status(201).json(booking[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to create booking' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT b.*, et.name as event_name, et.duration, et.location, et.color, u.name as host_name, u.email as host_email FROM bookings b JOIN event_types et ON b.event_type_id = et.id JOIN users u ON et.user_id = u.id WHERE b.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch booking' }); }
});

module.exports = router;
