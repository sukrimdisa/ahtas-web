# 🎉 AHTAS PRO API

**Production-Grade Spa & Therapy Booking System**

Zenoti / Fresha / Booksy style system for Yot Therapy scale-up.

## 🚀 Features

✅ Real-time booking calendar  
✅ Multi-therapist scheduling  
✅ Commission auto-calculate (70%)  
✅ Online payment ready (FPX/Stripe later)  
✅ Email confirmation  
✅ Google Drive backup database  
✅ Admin + Therapist + Customer portals  
✅ Dashboard analytics  
✅ Professional REST API  

## 🏗️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT
- **Email**: Nodemailer (SMTP)
- **Backup**: Google Sheets API

## 📦 Installation

```bash
cd ahtas-pro-api
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`
2. Update database connection:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/ahtas_pro"
   ```
3. Configure email settings (Gmail SMTP recommended)
4. (Optional) Set up Google Sheets for backup

## 🗄️ Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npm run seed
```

## 🎯 Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:4000`

## 📝 Default Login Credentials

After seeding:

- **Admin**: admin@ahtas.com / admin123
- **Therapist 1**: siti@ahtas.com / therapist123
- **Therapist 2**: fatimah@ahtas.com / therapist123
- **Customer**: ahmad@customer.com / customer123

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

### Booking
- `GET /booking/services` - Get all services
- `GET /booking/therapists` - Get all therapists
- `GET /booking/availability/:therapistId` - Get therapist availability
- `POST /booking/book` - Create booking (requires auth)
- `GET /booking/my-bookings` - Get user's bookings (requires auth)
- `GET /booking/all` - Get all bookings (admin only)

### Therapist
- `GET /therapist/:id` - Get therapist profile
- `GET /therapist/:id/income` - Get income dashboard (requires auth)
- `GET /therapist/:id/schedule` - Get schedule (requires auth)
- `POST /therapist/:id/availability` - Add availability (requires auth)

### Admin
- `GET /admin/dashboard` - Get dashboard stats (admin only)
- `GET /admin/users` - Get all users (admin only)
- `GET /admin/therapists` - Get all therapists (admin only)
- `GET /admin/revenue` - Get revenue report (admin only)

## 💰 Commission System

- Default therapist commission: **70%**
- Automatically calculated on each booking
- Tracked in `therapistIncome` field

## 📧 Email Notifications

Automatic email confirmation sent on booking with:
- Booking reference
- Service details
- Date & time
- Therapist name
- Payment status

## 📊 Google Sheets Backup

Optional backup of all bookings to Google Sheets for:
- Data redundancy
- Easy reporting
- External access

## 🔐 Security

- Passwords hashed with bcrypt
- JWT token authentication
- Role-based access control (ADMIN, THERAPIST, CUSTOMER)

## 🌐 Future Enhancements

- Payment gateway integration (FPX/Stripe)
- WhatsApp reminders
- Multi-branch support
- Staff payroll automation
- Customer loyalty system
- Package memberships
- AI schedule optimization

## 📄 License

Proprietary - AHTAS Pro System
