import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter
export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/**
 * Send booking confirmation email
 */
export async function sendConfirmation(email, data) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "✅ AHTAS PRO - Booking Confirmation",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .booking-detail { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .booking-detail strong { color: #667eea; display: block; margin-bottom: 5px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌿 AHTAS PRO</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Booking Confirmed</p>
            </div>
            <div class="content">
              <h2 style="color: #333;">Your appointment is confirmed!</h2>
              <p>Dear ${data.customerName},</p>
              <p>We're delighted to confirm your booking at AHTAS PRO.</p>
              
              <div class="booking-detail">
                <strong>Booking Reference</strong>
                <span style="font-size: 18px; font-weight: bold; color: #333;">${data.bookingRef}</span>
              </div>

              <div class="booking-detail">
                <strong>Service</strong>
                <span>${data.service}</span>
              </div>

              <div class="booking-detail">
                <strong>Date & Time</strong>
                <span>${data.date}</span>
              </div>

              <div class="booking-detail">
                <strong>Therapist</strong>
                <span>${data.therapist}</span>
              </div>

              <div class="booking-detail">
                <strong>Total Amount</strong>
                <span style="font-size: 20px; font-weight: bold; color: #667eea;">RM ${data.totalAmount}</span>
              </div>

              ${data.notes ? `
              <div class="booking-detail">
                <strong>Notes</strong>
                <span>${data.notes}</span>
              </div>
              ` : ''}

              <p style="margin-top: 25px;">Please arrive 10 minutes before your scheduled time.</p>
              <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>

              <a href="https://ahtas.com" class="btn">View My Bookings</a>
            </div>
            <div class="footer">
              <p>AHTAS PRO - Premium Spa & Therapy</p>
              <p>Yot Therapy | Production-Grade Booking System</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    // Don't throw - email failure shouldn't break booking
    return false;
  }
}

/**
 * Send booking reminder (24 hours before)
 */
export async function sendReminder(email, data) {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "⏰ AHTAS PRO - Appointment Reminder",
      html: `
        <h2>Appointment Reminder</h2>
        <p>This is a reminder for your upcoming appointment tomorrow.</p>
        <p><strong>Booking Ref:</strong> ${data.bookingRef}</p>
        <p><strong>Service:</strong> ${data.service}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Therapist:</strong> ${data.therapist}</p>
        <p>See you soon!</p>
      `
    });
    return true;
  } catch (error) {
    console.error("❌ Reminder email error:", error.message);
    return false;
  }
}
