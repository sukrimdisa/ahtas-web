import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

let auth = null;
let sheets = null;

/**
 * Initialize Google Sheets API
 */
export function initGoogleSheets() {
  try {
    // Only initialize if credentials are provided
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      process.env.GOOGLE_PRIVATE_KEY === "demo-key"
    ) {
      console.log("⚠️  Google Sheets: No credentials provided (demo mode)");
      return null;
    }

    auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
      ]
    );

    sheets = google.sheets({ version: "v4", auth });
    console.log("✅ Google Sheets API initialized");
    return sheets;
  } catch (error) {
    console.error("❌ Google Sheets init error:", error.message);
    return null;
  }
}

/**
 * Backup appointment to Google Sheets
 */
export async function backupToSheets(appointment) {
  if (!sheets || !process.env.GOOGLE_SPREADSHEET_ID) {
    console.log("⚠️  Skipping Google Sheets backup (not configured)");
    return false;
  }

  try {
    const values = [
      [
        appointment.bookingRef,
        appointment.customerEmail,
        appointment.therapistName,
        appointment.serviceName,
        appointment.startDt,
        appointment.totalAmount,
        appointment.therapistIncome,
        appointment.status,
        appointment.paymentStatus,
        new Date().toISOString()
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Bookings!A:J",
      valueInputOption: "USER_ENTERED",
      resource: { values }
    });

    console.log("✅ Backed up to Google Sheets:", appointment.bookingRef);
    return true;
  } catch (error) {
    console.error("❌ Google Sheets backup error:", error.message);
    return false;
  }
}

/**
 * Create sheets header if not exists
 */
export async function createSheetsHeader() {
  if (!sheets || !process.env.GOOGLE_SPREADSHEET_ID) {
    return false;
  }

  try {
    const header = [
      [
        "Booking Ref",
        "Customer Email",
        "Therapist",
        "Service",
        "Date/Time",
        "Total Amount",
        "Therapist Income",
        "Status",
        "Payment Status",
        "Created At"
      ]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Bookings!A1:J1",
      valueInputOption: "USER_ENTERED",
      resource: { values: header }
    });

    console.log("✅ Google Sheets header created");
    return true;
  } catch (error) {
    console.error("❌ Google Sheets header error:", error.message);
    return false;
  }
}

// Initialize on module load
initGoogleSheets();
