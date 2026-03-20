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
      subject: "AHTAS PRO - Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Booking Confirmed ✅</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Booking Reference:</strong> ${data.bookingRef}</p>
            <p><strong>Service:</strong> ${data.service}</p>
            <p><strong>Date & Time:</strong> ${data.date}</p>
            <p><strong>Therapist:</strong> ${data.therapist}</p>
            <p><strong>Total Amount:</strong> RM ${data.amount}</p>
          </div>
          <p style="color: #7f8c8d;">Thank you for choosing AHTAS PRO. See you soon!</p>
        </div>
      `
    });
    console.log(`✅ Confirmation email sent to ${email}`);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
}
