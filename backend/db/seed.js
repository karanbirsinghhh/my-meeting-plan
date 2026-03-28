const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
  // Connect without DB to create it
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'calendly_clone',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
  });

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(schema);
  console.log('✅ Database & tables created!');
  await conn.end();

  // Now connect to the DB
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'calendly_clone',
    port: process.env.DB_PORT || 3306,
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
  });

  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.query('TRUNCATE TABLE bookings');
  await db.query('TRUNCATE TABLE availability');
  await db.query('TRUNCATE TABLE event_types');
  await db.query('TRUNCATE TABLE users');
  await db.query('SET FOREIGN_KEY_CHECKS = 1');

  // Default user
  const [userRes] = await db.query(
    "INSERT INTO users (name, username, email, timezone) VALUES (?, ?, ?, ?)",
    ['Karanbir Singh', 'karanbir', 'karanbir@example.com', 'Asia/Kolkata']
  );
  const userId = userRes.insertId;
  console.log('  ✅ Default user created (ID:', userId, ')');

  // Event types
  const events = [
    ['15 Minute Meeting', '15min', 15, 'A quick 15-minute catch-up call.', 'Google Meet', '#0069ff'],
    ['30 Minute Meeting', '30min', 30, 'A 30-minute meeting for deeper discussion.', 'Google Meet', '#7b2ff7'],
    ['60 Minute Consultation', '60min', 60, 'A comprehensive 60-minute consultation.', 'Zoom', '#ff5722'],
  ];
  for (const e of events) {
    await db.query("INSERT INTO event_types (user_id, name, slug, duration, description, location, color) VALUES (?, ?, ?, ?, ?, ?, ?)", [userId, ...e]);
  }
  console.log('  ✅ Event types created (3)');

  // Availability Mon-Fri 9-5
  for (let day = 1; day <= 5; day++) {
    await db.query("INSERT INTO availability (user_id, day_of_week, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?)", [userId, day, '09:00:00', '17:00:00', true]);
  }
  await db.query("INSERT INTO availability (user_id, day_of_week, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?)", [userId, 0, '09:00:00', '17:00:00', false]);
  await db.query("INSERT INTO availability (user_id, day_of_week, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?)", [userId, 6, '09:00:00', '17:00:00', false]);
  console.log('  ✅ Availability set (Mon-Fri, 9 AM - 5 PM)');

  // Sample bookings
  const now = new Date();
  function nextDay(target, h, m) { const d = new Date(now); const diff = (target - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + diff); d.setHours(h, m, 0, 0); return d; }
  function pastDay(target, h, m) { const d = new Date(now); const diff = (d.getDay() - target + 7) % 7 || 7; d.setDate(d.getDate() - diff); d.setHours(h, m, 0, 0); return d; }
  function fmt(d) { return d.toISOString().slice(0, 19).replace('T', ' '); }

  const bookings = [
    [1, 'Alice Johnson', 'alice@example.com', nextDay(1, 10, 0), 15, 'confirmed'],
    [2, 'Bob Williams', 'bob@example.com', nextDay(2, 14, 0), 30, 'confirmed'],
    [3, 'Carol Davis', 'carol@example.com', nextDay(3, 11, 0), 60, 'confirmed'],
    [2, 'David Chen', 'david@example.com', pastDay(1, 15, 0), 30, 'confirmed'],
    [1, 'Eve Martinez', 'eve@example.com', pastDay(3, 9, 0), 15, 'cancelled'],
  ];
  for (const [etId, name, email, start, dur, status] of bookings) {
    const end = new Date(start.getTime() + dur * 60000);
    await db.query("INSERT INTO bookings (event_type_id, invitee_name, invitee_email, start_time, end_time, timezone, status) VALUES (?,?,?,?,?,?,?)",
      [etId, name, email, fmt(start), fmt(end), 'Asia/Kolkata', status]);
  }
  console.log('  ✅ Sample bookings created (5)');
  console.log('\n🎉 Database seeded successfully!');
  await db.end();
}

seed().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
