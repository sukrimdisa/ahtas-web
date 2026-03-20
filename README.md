# AHTAS PRO - Spa & Therapy Management System

Production-grade spa booking system with multi-therapist scheduling, commission tracking, and premium UI.

## Project Structure

```
├── ahtas-pro-api/     # Backend (Node.js + Express + Prisma)
├── ahtas-pro-web/     # Frontend (React + Vite)
└── ahtas-web/         # Original AHTAS booking system
```

## Quick Start

### Backend
```bash
cd ahtas-pro-api
npm install
cp .env.example .env  # Configure your database
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd ahtas-pro-web
npm install
npm run dev
```

## Features

- Multi-therapist scheduling
- Commission auto-calculation (70%)
- Online booking with slot selection
- Email confirmation
- Google Sheets backup
- Admin dashboard with analytics
- Therapist income tracking
- JWT authentication
- Premium spa UI design

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma
- Email: Nodemailer
- Backup: Google Sheets API

## Environment Variables

Create `.env` in `ahtas-pro-api/`:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=4000
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=app-password
MAIL_FROM=AHTAS <noreply@ahtas.my>
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SPREADSHEET_ID=...
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Booking
- `GET /api/services` - List services
- `POST /api/book` - Create booking
- `GET /api/appointments` - List appointments
- `GET /api/appointments/:ref` - Get by reference

### Therapist
- `GET /api/therapists` - List therapists
- `GET /api/therapists/:id` - Get therapist details
- `GET /api/therapists/:id/income` - Get income report

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics` - Analytics data

## Future Enhancements

- Payment gateway (FPX/Stripe)
- WhatsApp reminder
- Multi-branch support
- Staff payroll
- Customer loyalty
- Package memberships
- AI scheduling optimization
