import { google } from "googleapis";

let auth = null;
let sheets = null;

try {
  auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive"
    ]
  );

  sheets = google.sheets({ version: "v4", auth });
} catch (error) {
  console.warn("⚠️ Google Sheets not configured. Backup feature disabled.");
}

export { sheets };

export async function backupToSheets(data) {
  if (!sheets || !process.env.GOOGLE_SPREADSHEET_ID) {
    console.log("⚠️ Google Sheets backup skipped - not configured");
    return;
  }

  try {
    const values = [[
      data.bookingRef,
      data.customerName,
      data.customerEmail,
      data.service,
      data.therapist,
      data.date,
      data.amount,
      data.therapistIncome,
      data.status,
      data.paymentStatus,
      new Date().toISOString()
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Bookings!A:K",
      valueInputOption: "USER_ENTERED",
      resource: { values }
    });

    console.log("✅ Booking backed up to Google Sheets");
  } catch (error) {
    console.error("❌ Error backing up to Google Sheets:", error.message);
    // Don't throw error - booking should succeed even if backup fails
  }
}
