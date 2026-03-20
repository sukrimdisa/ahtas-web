# 🎉 AHTAS PRO - Complete Setup Guide

**Production-Grade Spa & Therapy Booking System**

Zenoti / Fresha / Booksy style system untuk Yot Therapy scale-up 💪

---

## 📁 Project Structure

```
/vercel/sandbox/
├── ahtas-pro-api/          # Backend API (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── config/         # Email & Google Sheets config
│   │   ├── middleware/     # JWT authentication
│   │   ├── routes/         # API endpoints
│   │   └── server.js       # Main server file
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Sample data
│   ├── package.json
│   └── .env                # Configuration
│
└── (root)/                 # Frontend (React + Vite)
    ├── src/
    │   ├── pages/          # Main pages
    │   ├── components/     # Reusable components
    │   ├── api/            # API client
    │   └── App.jsx         # Main app
    └── package.json
```

---

## 🚀 STEP 1: Backend Setup

### 1.1 Install Dependencies

```bash
cd ahtas-pro-api
npm install
```

### 1.2 Setup PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not installed)
# Amazon Linux 2023:
sudo dnf install postgresql15 postgresql15-server

# Initialize and start
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE ahtas_pro;
CREATE USER ahtas_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ahtas_pro TO ahtas_user;
\q
```

**Option B: Use Cloud Database (Recommended for Production)**
- Supabase (Free tier available)
- Railway.app
- Neon.tech
- AWS RDS

### 1.3 Configure Environment Variables

Edit `ahtas-pro-api/.env`:

```env
# Database
DATABASE_URL="postgresql://ahtas_user:your_password@localhost:5432/ahtas_pro?schema=public"

# JWT Secret (change this!)
JWT_SECRET="your-super-secret-key-change-this-in-production"

# Email (Gmail SMTP)
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"  # Use App Password, not regular password
MAIL_FROM="AHTAS Pro <noreply@ahtas.com>"

# Google Sheets (Optional - for backup)
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID="your-spreadsheet-id"

# Server
PORT=4000
```

### 1.4 Setup Database Schema

```bash
cd ahtas-pro-api

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npm run seed
```

### 1.5 Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server akan berjalan di: **http://localhost:4000**

---

## 🎨 STEP 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd /vercel/sandbox
npm install
```

### 2.2 Configure API Endpoint

File `src/api/client.js` sudah dikonfigurasi untuk:
- Development: `http://localhost:4000`
- Production: Set `VITE_API_URL` environment variable

### 2.3 Start Frontend

```bash
npm run dev
```

Frontend akan berjalan di: **http://localhost:5173**

---

## 📝 STEP 3: Login & Test

### Default Login Credentials

Selepas seeding database:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ahtas.com | admin123 |
| **Therapist 1** | siti@ahtas.com | therapist123 |
| **Therapist 2** | fatimah@ahtas.com | therapist123 |
| **Customer** | ahmad@customer.com | customer123 |

### Test Flow

1. **Login sebagai Customer** (ahmad@customer.com)
   - Buka http://localhost:5173/login
   - Login dengan credentials customer
   - Pergi ke "Booking" page
   - Pilih service, therapist, dan date
   - Create booking

2. **Login sebagai Therapist** (siti@ahtas.com)
   - View schedule di "Day View" atau "Week View"
   - Check income dashboard

3. **Login sebagai Admin** (admin@ahtas.com)
   - View dashboard analytics
   - See all bookings
   - View revenue reports

---

## 🔌 API Endpoints

### Authentication
```
POST /auth/register    - Register user baru
POST /auth/login       - Login
```

### Booking
```
GET  /booking/services              - Get semua services
GET  /booking/therapists            - Get semua therapists
GET  /booking/availability/:id      - Get therapist availability
POST /booking/book                  - Create booking (requires auth)
GET  /booking/my-bookings           - Get user bookings (requires auth)
GET  /booking/all                   - Get all bookings (admin only)
```

### Therapist
```
GET  /therapist/:id                 - Get therapist profile
GET  /therapist/:id/income          - Get income dashboard (requires auth)
GET  /therapist/:id/schedule        - Get schedule (requires auth)
POST /therapist/:id/availability    - Add availability (requires auth)
```

### Admin
```
GET  /admin/dashboard               - Dashboard stats (admin only)
GET  /admin/users                   - All users (admin only)
GET  /admin/therapists              - All therapists (admin only)
GET  /admin/revenue                 - Revenue report (admin only)
```

---

## 💰 Commission System

- **Default commission**: 70% untuk therapist
- Automatically calculated pada setiap booking
- Tracked dalam field `therapistIncome`

**Example:**
- Service price: RM 100
- Therapist commission: 70%
- Therapist income: RM 70
- Business profit: RM 30

---

## 📧 Email Setup (Gmail)

### Enable App Password

1. Go to Google Account settings
2. Security → 2-Step Verification (enable if not enabled)
3. App passwords → Generate new app password
4. Copy password dan masukkan dalam `.env` file

### Test Email

Email confirmation akan automatically sent bila customer create booking.

---

## 📊 Google Sheets Backup (Optional)

### Setup

1. Create Google Cloud Project
2. Enable Google Sheets API
3. Create Service Account
4. Download JSON key
5. Copy email dan private key ke `.env`
6. Create Google Sheet dan share dengan service account email
7. Copy spreadsheet ID ke `.env`

### Benefits

- Automatic backup setiap booking
- Easy reporting & analytics
- External access untuk non-technical users

---

## 🔐 Security Features

✅ Password hashing dengan bcrypt  
✅ JWT token authentication  
✅ Role-based access control (ADMIN, THERAPIST, CUSTOMER)  
✅ Protected API endpoints  
✅ CORS enabled  

---

## 🌐 Production Deployment

### Backend (Railway/Render/Heroku)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy!

### Frontend (Vercel/Netlify)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy!

---

## 🔥 Future Enhancements

Sistem ini ready untuk ditambah:

- ✨ Payment gateway (FPX/Stripe)
- ✨ WhatsApp notifications
- ✨ Multi-branch support
- ✨ Staff payroll automation
- ✨ Customer loyalty program
- ✨ Package memberships
- ✨ AI schedule optimization
- ✨ Mobile app (React Native)

---

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string in .env
DATABASE_URL="postgresql://user:password@localhost:5432/ahtas_pro"
```

### Email Not Sending
- Check Gmail App Password is correct
- Ensure 2-Step Verification is enabled
- Check SMTP settings in .env

### Frontend Can't Connect to Backend
- Ensure backend is running on port 4000
- Check API_BASE in `src/api/client.js`
- Check CORS is enabled in backend

### Prisma Errors
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## 📞 Support

Untuk soalan atau masalah, hubungi development team.

---

## 🎉 Selamat Menggunakan AHTAS PRO!

System ini direka untuk scale-up Yot Therapy dengan features professional seperti Zenoti, Fresha, dan Booksy.

**Happy booking! 🌿💆‍♀️**
