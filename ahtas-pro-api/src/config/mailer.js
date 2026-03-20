import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function sendConfirmation(email, data) {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "✅ AHTAS Booking Confirmation",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your appointment has been successfully booked</p>
            </div>
            <div class="content">
              <div class="booking-details">
                <div class="detail-row">
                  <span class="label">Booking Reference:</span>
                  <span><strong>${data.bookingRef}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="label">Service:</span>
                  <span>${data.service}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date & Time:</span>
                  <span>${data.date}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Therapist:</span>
                  <span>${data.therapist}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span>
                  <span><strong>RM ${data.amount}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment Status:</span>
                  <span style="color: green;">${data.paymentStatus}</span>
                </div>
              </div>
              <p>Please arrive 10 minutes before your appointment time.</p>
              <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
            </div>
            <div class="footer">
              <p>AHTAS Pro - Premium Spa & Therapy System</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    console.log(`✅ Confirmation email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    // Don't throw error - booking should succeed even if email fails
  }
}
