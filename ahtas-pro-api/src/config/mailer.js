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
      from: process.env.MAIL_FROM || "noreply@ahtas.my",
      to: email,
      subject: "AHTAS Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2D3748;">Booking Confirmed!</h2>
          <p>Terima kasih atas tempahan anda. Berikut adalah butiran tempahan anda:</p>
          <div style="background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ref:</strong> ${data.bookingRef}</p>
            <p><strong>Service:</strong> ${data.service}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Therapist:</strong> ${data.therapist}</p>
            <p><strong>Total:</strong> RM ${data.totalAmount}</p>
          </div>
          <p>Jumpa anda soon!</p>
          <p><strong>AHTAS Therapy</strong></p>
        </div>
      `
    });
  } catch (error) {
    console.error("Email send failed:", error.message);
  }
}
