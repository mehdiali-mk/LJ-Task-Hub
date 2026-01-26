import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FROM_EMAIL, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // App Password
  },
});

export const sendEmail = async (to, subject, html) => {
  const msg = {
    from: `TaskForge <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(msg);
    console.log("Email sent successfully via Gmail");
    return true;
  } catch (error) {
    console.error("Error sending email via Gmail:", error);
    return false;
  }
};
