import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function sendConfirmation(email, data) {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || "AHTAS PRO <noreply@yottherapy.com>",
      to: email,
      subject: "✅ Tempahan AHTAS Disahkan / Booking Confirmed",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .booking-ref { background: #f7fafc; border-left: 4px solid #667eea; padding: 15px 20px; margin: 20px 0; }
            .booking-ref strong { color: #667eea; font-size: 20px; }
            .details { background: #f7fafc; border-radius: 12px; padding: 25px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { color: #64748b; font-weight: 500; }
            .detail-value { font-weight: 600; color: #1e293b; }
            .footer { background: #f7fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 AHTAS PRO</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Yot Therapy Booking System</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e293b; margin-top: 0;">Tempahan Berjaya! / Booking Confirmed!</h2>
              
              <div class="booking-ref">
                <div style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Nombor Rujukan / Reference Number</div>
                <strong>${data.bookingRef}</strong>
              </div>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Perkhidmatan / Service</span>
                  <span class="detail-value">${data.service}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tarikh & Masa / Date & Time</span>
                  <span class="detail-value">${data.date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Juruterapist / Therapist</span>
                  <span class="detail-value">${data.therapist}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tempoh / Duration</span>
                  <span class="detail-value">${data.duration} minit</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Jumlah / Total</span>
                  <span class="detail-value" style="color: #667eea; font-size: 18px;">RM ${data.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <strong style="color: #f59e0b;">📌 Nota Penting:</strong>
                <ul style="margin: 10px 0; padding-left: 20px; color: #78350f;">
                  <li>Sila tiba 10 minit lebih awal / Please arrive 10 minutes early</li>
                  <li>Bawa nombor rujukan ini / Bring this reference number</li>
                  <li>Hubungi kami untuk sebarang pertanyaan / Contact us for any inquiries</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <p style="color: #64748b;">Terima kasih kerana memilih AHTAS PRO!</p>
                <p style="color: #64748b; font-size: 14px;">Thank you for choosing AHTAS PRO!</p>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Yot Therapy</strong></p>
              <p>📞 +60 12-345 6789 | 📧 info@yottherapy.com</p>
              <p style="margin-top: 15px; font-size: 12px;">© 2026 AHTAS PRO. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    console.log(`✅ Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    return false;
  }
}

export async function sendCancellation(email, data) {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || "AHTAS PRO <noreply@yottherapy.com>",
      to: email,
      subject: "❌ Tempahan Dibatalkan / Booking Cancelled",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .footer { background: #f7fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Pembatalan Tempahan</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Booking Cancellation</p>
            </div>
            
            <div class="content">
              <p>Tempahan anda telah dibatalkan / Your booking has been cancelled.</p>
              <p><strong>Rujukan:</strong> ${data.bookingRef}</p>
              <p><strong>Perkhidmatan:</strong> ${data.service}</p>
              <p><strong>Tarikh:</strong> ${data.date}</p>
              
              <p style="margin-top: 30px;">Jika anda ingin membuat tempahan baharu, sila hubungi kami.</p>
              <p>If you wish to make a new booking, please contact us.</p>
            </div>
            
            <div class="footer">
              <p><strong>Yot Therapy</strong></p>
              <p>📞 +60 12-345 6789 | 📧 info@yottherapy.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    return true;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    return false;
  }
}
