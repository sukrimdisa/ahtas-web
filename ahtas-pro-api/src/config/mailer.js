import nodemailer from "nodemailer";

// Create transporter
export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Send booking confirmation email
export async function sendBookingConfirmation(email, bookingData) {
  try {
    // Skip if email credentials not configured
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.log("⚠️  Email not configured. Skipping email send.");
      return { success: false, message: "Email not configured" };
    }

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `AHTAS Booking Confirmation - ${bookingData.bookingRef}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .booking-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .label {
              font-weight: 600;
              color: #667eea;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌸 AHTAS PRO</h1>
            <p>Your Booking is Confirmed!</p>
          </div>
          
          <div class="content">
            <h2>Booking Confirmation</h2>
            <p>Dear ${bookingData.customerName},</p>
            <p>Your appointment has been successfully booked. Here are your booking details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="label">Booking Reference:</span>
                <span><strong>${bookingData.bookingRef}</strong></span>
              </div>
              <div class="detail-row">
                <span class="label">Service:</span>
                <span>${bookingData.serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Therapist:</span>
                <span>${bookingData.therapistName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date & Time:</span>
                <span>${bookingData.dateTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span>${bookingData.duration} minutes</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span><strong>RM ${bookingData.totalAmount}</strong></span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span style="color: green;">${bookingData.status}</span>
              </div>
            </div>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Please arrive 10 minutes before your appointment</li>
              <li>Bring your booking reference for check-in</li>
              <li>Contact us if you need to reschedule</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>AHTAS PRO - Premium Spa & Therapy</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </body>
        </html>
      `
    });

    console.log("✅ Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email error:", error.message);
    return { success: false, error: error.message };
  }
}

// Send therapist notification
export async function sendTherapistNotification(email, bookingData) {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.log("⚠️  Email not configured. Skipping email send.");
      return { success: false, message: "Email not configured" };
    }

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `New Booking Alert - ${bookingData.bookingRef}`,
      html: `
        <h2>New Booking Assigned</h2>
        <p>Dear ${bookingData.therapistName},</p>
        <p>You have a new booking:</p>
        <ul>
          <li>Reference: ${bookingData.bookingRef}</li>
          <li>Customer: ${bookingData.customerName}</li>
          <li>Service: ${bookingData.serviceName}</li>
          <li>Date/Time: ${bookingData.dateTime}</li>
          <li>Your Income: RM ${bookingData.therapistIncome}</li>
        </ul>
      `
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Therapist email error:", error.message);
    return { success: false, error: error.message };
  }
}
