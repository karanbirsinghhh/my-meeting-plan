const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT et.*, u.name as user_name, u.username FROM event_types et JOIN users u ON et.user_id = u.id WHERE et.user_id = 1 ORDER BY et.created_at DESC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch event types' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT et.*, u.name as user_name, u.username FROM event_types et JOIN users u ON et.user_id = u.id WHERE et.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Event type not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch event type' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, slug, duration, description, location, color } = req.body;
    if (!name || !slug || !duration) return res.status(400).json({ error: 'Name, slug, and duration are required' });
    const [existing] = await pool.query('SELECT id FROM event_types WHERE user_id = 1 AND slug = ?', [slug]);
    if (existing.length) return res.status(409).json({ error: 'Slug already exists' });
    const [result] = await pool.query(
      'INSERT INTO event_types (user_id, name, slug, duration, description, location, color) VALUES (1,?,?,?,?,?,?)',
      [name, slug, duration, description || '', location || 'Google Meet', color || '#0069ff']
    );
    const [newRow] = await pool.query('SELECT * FROM event_types WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to create event type' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, slug, duration, description, location, color, is_active } = req.body;
    const [existing] = await pool.query('SELECT * FROM event_types WHERE id = ? AND user_id = 1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Event type not found' });
    if (slug && slug !== existing[0].slug) {
      const [dup] = await pool.query('SELECT id FROM event_types WHERE user_id = 1 AND slug = ? AND id != ?', [slug, req.params.id]);
      if (dup.length) return res.status(409).json({ error: 'Slug already exists' });
    }
    await pool.query(
      `UPDATE event_types SET name=COALESCE(?,name), slug=COALESCE(?,slug), duration=COALESCE(?,duration), description=COALESCE(?,description), location=COALESCE(?,location), color=COALESCE(?,color), is_active=COALESCE(?,is_active) WHERE id=? AND user_id=1`,
      [name||null, slug||null, duration||null, description!==undefined?description:null, location||null, color||null, is_active!==undefined?is_active:null, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM event_types WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to update event type' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM event_types WHERE id = ? AND user_id = 1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Event type not found' });
    // Delete related bookings first (foreign key)
    await pool.query('DELETE FROM bookings WHERE event_type_id = ?', [req.params.id]);
    await pool.query('DELETE FROM event_types WHERE id = ? AND user_id = 1', [req.params.id]);
    res.json({ message: 'Event type deleted successfully' });
  } catch (e) {
    console.error('Delete error:', e);
    res.status(500).json({ error: 'Failed to delete event type' });
  }
});

module.exports = router;
