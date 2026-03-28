const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM availability WHERE user_id = 1 ORDER BY day_of_week ASC');
    const [user] = await pool.query('SELECT timezone FROM users WHERE id = 1');
    res.json({ timezone: user[0]?.timezone || 'Asia/Kolkata', schedule: rows });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch availability' }); }
});

router.put('/', async (req, res) => {
  try {
    const { timezone, schedule } = req.body;
    if (timezone) await pool.query('UPDATE users SET timezone = ? WHERE id = 1', [timezone]);
    if (schedule && Array.isArray(schedule)) {
      await pool.query('DELETE FROM availability WHERE user_id = 1');
      for (const s of schedule) {
        await pool.query('INSERT INTO availability (user_id, day_of_week, start_time, end_time, is_active) VALUES (1,?,?,?,?)',
          [s.day_of_week, s.start_time, s.end_time, s.is_active !== false]);
      }
    }
    const [rows] = await pool.query('SELECT * FROM availability WHERE user_id = 1 ORDER BY day_of_week ASC');
    const [user] = await pool.query('SELECT timezone FROM users WHERE id = 1');
    res.json({ timezone: user[0]?.timezone || 'Asia/Kolkata', schedule: rows });
  } catch (e) { res.status(500).json({ error: 'Failed to update availability' }); }
});

module.exports = router;
