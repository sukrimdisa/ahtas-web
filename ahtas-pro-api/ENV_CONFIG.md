# AHTAS PRO API - Environment Configuration

Copy this file to `.env` and update with your actual values:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ahtas_pro?schema=public"

# JWT
JWT_SECRET="ahtas-pro-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Email (SMTP)
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"
MAIL_FROM="AHTAS PRO <noreply@yottherapy.com>"

# Google Sheets Backup (Optional)
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID="your-spreadsheet-id"

# Server
PORT=4000
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```
