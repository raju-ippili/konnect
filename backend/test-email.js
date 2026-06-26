import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const email = process.env.SMTP_EMAIL;
const pass = process.env.SMTP_PASSWORD;

console.log("Email: ", email);
console.log("Pass: ", pass);

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Konnect Test" <${email}>`,
      to: email, // send to self
      subject: "Test Email from Konnect",
      text: "This is a test email to verify SMTP configuration.",
    });

    console.log("Success! Email sent. Message ID:", info.messageId);
  } catch (error) {
    console.error("Failed to send email. Error:", error);
  }
}

testEmail();
