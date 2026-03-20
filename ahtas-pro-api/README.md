# 🌿 AHTAS PRO API

**Production-Grade Spa & Therapy Booking System**

A comprehensive REST API for managing spa and therapy appointments, similar to Zenoti, Fresha, and Booksy.

## 🚀 Features

### Core Features
- ✅ **Real-time booking calendar** with slot management
- ✅ **Multi-therapist scheduling** with availability tracking
- ✅ **Automatic commission calculation** (configurable per therapist)
- ✅ **Email confirmations** for bookings
- ✅ **Google Sheets backup** for data redundancy
- ✅ **JWT authentication** with role-based access (Admin/Therapist/Customer)
- ✅ **Admin dashboard** with analytics
- ✅ **Therapist income tracking** and reporting

### PRO Features
- 📊 Revenue analytics by period (day/week/month/year)
- 💰 Commission auto-calculation (70% default)
- 📈 Utilization tracking
- 🎯 No-show rate monitoring
- 👥 Multi-role user management
- 🔒 Secure authentication with JWT

## 📦 Installation

### Prerequisites
- Node.js v20 LTS or higher
- PostgreSQL (or SQLite for demo)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and SMTP credentials
   ```

3. **Setup database**
   ```bash
   # Initialize Prisma
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Seed sample data
   npm run seed
   ```

4. **Start server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

Server will run on `http://localhost:4000`

## 🗄️ Database Schema

### Models
- **User** - Admin, Therapist, or Customer accounts
- **Therapist** - Therapist profile with commission rate
- **Service** - Available treatments (massage, reflexology, etc.)
- **TherapistService** - Many-to-many relationship
- **Availability** - Therapist working hours
- **Appointment** - Bookings with commission tracking

## 🔐 API Endpoints

### Authentication
```
POST   /auth/register    - Register new user
POST   /auth/login       - Login user
GET    /auth/me          - Get current user
```

### Services
```
GET    /services         - List all services
GET    /services/:id     - Get service details
POST   /services         - Create service (Admin)
PATCH  /services/:id     - Update service (Admin)
DELETE /services/:id     - Deactivate service (Admin)
```

### Therapists
```
GET    /therapists           - List all therapists
GET    /therapists/:id       - Get therapist details
GET    /therapists/:id/income - Income dashboard (PRO)
PATCH  /therapists/:id       - Update commission (Admin)
POST   /therapists/:id/services - Assign service (Admin)
```

### Booking
```
POST   /booking/appointments      - Create booking (PRO Engine)
GET    /booking/appointments      - List bookings (filtered)
GET    /booking/appointments/:id  - Get booking details
PATCH  /booking/appointments/:id  - Update status
DELETE /booking/appointments/:id  - Cancel booking
GET    /booking/availability      - Check therapist availability
```

### Admin
```
GET    /admin/dashboard       - Dashboard analytics (PRO)
GET    /admin/users           - List all users
GET    /admin/reports/revenue - Revenue report by period
```

## 🧪 Sample Credentials

After running `npm run seed`:

| Role      | Email                  | Password      |
|-----------|------------------------|---------------|
| Admin     | admin@ahtas.com        | admin123      |
| Therapist | siti@ahtas.com         | therapist123  |
| Therapist | aminah@ahtas.com       | therapist123  |
| Customer  | ahmad@customer.com     | customer123   |

## 📊 PRO Booking Engine

The booking engine includes:
- **Conflict detection** - Prevents double-booking
- **Automatic end time calculation** - Based on service duration
- **Commission calculation** - Therapist income = price × commission rate
- **Email notifications** - Async confirmation emails
- **Google Sheets backup** - Automatic data backup
- **Booking reference** - Unique AHTAS-XXXXXXXX format

### Example Booking Request

```bash
curl -X POST http://localhost:4000/booking/appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "therapist-uuid",
    "serviceId": "service-uuid",
    "startDt": "2026-03-20T10:00:00Z",
    "notes": "First time customer"
  }'
```

### Response
```json
{
  "id": "appointment-uuid",
  "bookingRef": "AHTAS-A3F9B2C1",
  "totalAmount": 100,
  "therapistIncome": 70,
  "status": "CONFIRMED",
  "paymentStatus": "PAID"
}
```

## 🎯 Commission System

Therapist commission is configurable (default 70%):

```
Total Amount: RM 100
Therapist Income: RM 70 (70%)
Company Income: RM 30 (30%)
```

## 📧 Email Integration

Configure SMTP in `.env`:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM="AHTAS PRO <noreply@ahtas.com>"
```

## 📊 Google Sheets Backup

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account
4. Download JSON key
5. Add credentials to `.env`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

## 🚀 Future Enhancements

Ready for:
- 💳 Payment gateway integration (FPX/Stripe)
- 📱 WhatsApp reminders
- 🏢 Multi-branch support
- 💼 Staff payroll automation
- 🎁 Customer loyalty program
- 📦 Package memberships
- 🤖 AI schedule optimization

## 📄 License

MIT

## 🤝 Support

For Yot Therapy scale-up operations.

Built with ❤️ using Node.js, Express, Prisma, and PostgreSQL.
