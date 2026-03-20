import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function sendConfirmation(email, data) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "AHTAS Booking Confirmation",
    html: `
      <h2>Booking Confirmed</h2>
      <p>Ref: ${data.bookingRef}</p>
      <p>Service: ${data.service}</p>
      <p>Date: ${data.date}</p>
      <p>Therapist: ${data.therapist}</p>
    `
  });
}
