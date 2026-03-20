import { google } from "googleapis";

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
  ]
);

export const sheets = google.sheets({ version: "v4", auth });

export async function backupToSheets(data) {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      console.warn("⚠️ GOOGLE_SHEET_ID not configured, skipping backup");
      return;
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Bookings!A:H",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [data]
      }
    });

    console.log("✅ Booking backed up to Google Sheets");
  } catch (error) {
    console.error("❌ Google Sheets backup failed:", error.message);
  }
}
