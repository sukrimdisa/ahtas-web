import { google } from "googleapis";

let auth = null;
let sheets = null;

// Initialize Google Auth
export function initGoogleAuth() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.log("⚠️  Google Sheets credentials not configured. Backup disabled.");
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

// Backup booking to Google Sheets
export async function backupBookingToSheets(bookingData) {
  try {
    if (!sheets || !process.env.GOOGLE_SPREADSHEET_ID) {
      console.log("⚠️  Google Sheets backup skipped (not configured)");
      return { success: false, message: "Not configured" };
    }

    const values = [
      [
        bookingData.bookingRef,
        bookingData.customerName,
        bookingData.customerEmail,
        bookingData.therapistName,
        bookingData.serviceName,
        bookingData.dateTime,
        bookingData.totalAmount,
        bookingData.therapistIncome,
        bookingData.status,
        bookingData.paymentStatus,
        new Date().toISOString()
      ]
    ];

    const resource = {
      values
    };

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Bookings!A:K",
      valueInputOption: "RAW",
      resource
    });

    console.log("✅ Booking backed up to Google Sheets");
    return { success: true };
  } catch (error) {
    console.error("❌ Google Sheets backup error:", error.message);
    return { success: false, error: error.message };
  }
}

// Create backup spreadsheet headers
export async function initSpreadsheetHeaders() {
  try {
    if (!sheets || !process.env.GOOGLE_SPREADSHEET_ID) {
      return { success: false, message: "Not configured" };
    }

    const headers = [
      [
        "Booking Ref",
        "Customer Name",
        "Customer Email",
        "Therapist Name",
        "Service Name",
        "Date Time",
        "Total Amount",
        "Therapist Income",
        "Status",
        "Payment Status",
        "Created At"
      ]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Bookings!A1:K1",
      valueInputOption: "RAW",
      resource: { values: headers }
    });

    console.log("✅ Spreadsheet headers initialized");
    return { success: true };
  } catch (error) {
    console.error("❌ Header init error:", error.message);
    return { success: false, error: error.message };
  }
}

export { sheets };
