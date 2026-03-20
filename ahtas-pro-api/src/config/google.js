import { google } from "googleapis";

let auth = null;
let sheets = null;

try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
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
  } else {
    console.log("⚠️  Google Sheets backup disabled (credentials not configured)");
  }
} catch (error) {
  console.error("❌ Google Sheets initialization error:", error.message);
}

export { sheets };

export async function backupAppointment(appointment) {
  if (!sheets || !process.env.GOOGLE_SPREADSHEET_ID) {
    console.log("⚠️  Skipping Google Sheets backup (not configured)");
    return false;
  }

  try {
    const values = [
      [
        appointment.bookingRef,
        appointment.customerName,
        appointment.serviceName,
        appointment.therapistName,
        appointment.startDt.toISOString(),
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

    console.log(`✅ Backed up appointment ${appointment.bookingRef} to Google Sheets`);
    return true;
  } catch (error) {
    console.error("❌ Google Sheets backup error:", error.message);
    return false;
  }
}

export async function initializeSpreadsheet() {
  if (!sheets || !process.env.GOOGLE_SPREADSHEET_ID) {
    return false;
  }

  try {
    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Bookings!A1:J1"
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        range: "Bookings!A1:J1",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            [
              "Booking Ref",
              "Customer",
              "Service",
              "Therapist",
              "Date/Time",
              "Total (RM)",
              "Therapist Income (RM)",
              "Status",
              "Payment",
              "Created At"
            ]
          ]
        }
      });
      console.log("✅ Initialized Google Sheets headers");
    }
    return true;
  } catch (error) {
    console.error("❌ Spreadsheet initialization error:", error.message);
    return false;
  }
}
