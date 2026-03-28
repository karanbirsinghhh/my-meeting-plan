# 🗓️ My Meeting Plan — Scheduling Platform (Calendly Clone)

A full-stack scheduling/booking web application that replicates Calendly's design and user experience. Built as part of the Scaler SDE Intern Fullstack Assignment.

![My Meeting Plan](https://img.shields.io/badge/Next.js-React-blue) ![Express](https://img.shields.io/badge/Express.js-Node-green) ![MySQL](https://img.shields.io/badge/MySQL-Database-orange)

## 🚀 Live Demo

- **Frontend**: [Deployed URL]
- **Backend API**: [Deployed URL]

## ✨ Features

### Core Features
- **Event Types Management** — Create, edit, delete event types with custom durations, colors, and URL slugs
- **Availability Settings** — Set available days/hours per week with timezone support
- **Public Booking Page** — Month calendar view, time slot selection, booking form, confirmation page
- **Meetings Page** — View upcoming/past meetings with cancel functionality
- **Double Booking Prevention** — Real-time conflict detection across all event types

### Bonus Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Calendly-faithful UI design
- ✅ Sample data seeding
- ✅ Clean, modular code architecture

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (React, App Router) |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL 8.0 |
| **Styling** | Vanilla CSS (custom design system) |
| **Font** | Inter (Google Fonts) |

## 📦 Project Structure

```
scaler/
├── backend/
│   ├── server.js           # Express entry point
│   ├── db/
│   │   ├── schema.sql      # MySQL schema
│   │   ├── connection.js   # DB connection pool
│   │   ├── setup.js        # Schema creation script
│   │   └── seed.js         # Sample data seeder
│   └── routes/
│       ├── eventTypes.js   # CRUD for event types
│       ├── availability.js # Availability settings
│       ├── bookings.js     # Booking + slot generation
│       └── meetings.js     # Meetings list + cancel
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.js              # Event Types (dashboard)
│       │   ├── availability/page.js # Availability settings
│       │   ├── meetings/page.js     # Meetings view
│       │   ├── [username]/page.js   # Public user page
│       │   └── [username]/[slug]/   # Public booking page
│       ├── components/
│       │   ├── Sidebar.js           # Navigation sidebar
│       │   ├── Calendar.js          # Month calendar picker
│       │   ├── TimeSlots.js         # Time slot selector
│       │   ├── BookingForm.js       # Booking form
│       │   └── Toast.js             # Notifications
│       └── lib/
│           └── api.js               # API client
└── README.md
```

## 🗄️ Database Schema

```
users           → Default logged-in user
event_types     → Meeting templates (name, slug, duration, color)
availability    → Weekly schedule (day, start_time, end_time)
bookings        → Scheduled meetings (invitee info, times, status)
```

Key relationships:
- `event_types.user_id` → `users.id`
- `availability.user_id` → `users.id`
- `bookings.event_type_id` → `event_types.id`

## ⚡ Setup Instructions

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/calendly-clone.git
cd calendly-clone
```

### 2. Set up the backend
```bash
cd backend
npm install

# Configure database credentials
# Edit .env file with your MySQL password:
# DB_PASSWORD=your_mysql_password

# Create database and tables
npm run setup-db

# Seed sample data
npm run seed

# Start the server
npm run dev
```

### 3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
- **Admin Dashboard**: http://localhost:3000
- **Public Booking Page**: http://localhost:3000/karanbir

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/event-types` | List event types |
| POST | `/api/event-types` | Create event type |
| PUT | `/api/event-types/:id` | Update event type |
| DELETE | `/api/event-types/:id` | Delete event type |
| GET | `/api/availability` | Get availability schedule |
| PUT | `/api/availability` | Update availability |
| GET | `/api/bookings/slots/:username/:slug?date=` | Get available time slots |
| GET | `/api/bookings/available-dates/:username/:slug?month=` | Get available dates |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/meetings?type=upcoming\|past` | List meetings |
| PUT | `/api/meetings/:id/cancel` | Cancel a meeting |
| GET | `/api/users/:username` | Get user info |

## 🎨 Design Decisions

1. **Calendly-faithful UI**: Used Calendly's exact color scheme (#0069ff primary), layout patterns (sidebar nav + content area for admin, dual-panel booking widget), and component styles.

2. **No Authentication**: Per requirements, a default user (ID: 1) is assumed logged in. Public booking pages are accessible without login.

3. **Double-booking Prevention**: When generating available slots, the system checks ALL event types of the user for conflicts, not just the current one. This prevents overlapping meetings across different event types.

4. **Modular Architecture**: Clean separation of concerns — routes handle HTTP, database queries are co-located, and frontend components are reusable.

## 🧪 Assumptions
- A single default user is pre-seeded in the database
- Timezone handling is done client-side using `Intl.DateTimeFormat`
- Time slots are generated based on event duration (no partial slots)
- Past time slots are automatically hidden

## 👤 Author
Karanbir Singh
