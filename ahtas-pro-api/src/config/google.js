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
  if (!process.env.GOOGLE_SPREADSHEET_ID) return;
  
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "A1:H1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          data.bookingRef,
          data.customerName,
          data.service,
          data.therapist,
          data.date,
          data.totalAmount,
          data.therapistIncome,
          new Date().toISOString()
        ]]
      }
    });
  } catch (error) {
    console.error("Sheet backup failed:", error.message);
  }
}
