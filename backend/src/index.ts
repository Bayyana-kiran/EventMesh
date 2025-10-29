import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.post("/send-email", async (req, res) => {
  const { to, subject, plainText, html } = req.body;
  if (!to || !subject || !plainText) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const info = await sendEmailSMTP(
      Array.isArray(to) ? to : [to],
      subject,
      plainText,
      html
    );
    res.json({ success: true, info });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Email API server running on port ${PORT}`);
});

export type InputPayload = {
  to?: string | string[];
  subject?: string;
  plainText?: string;
  html?: string;
  workspaceId?: string;
};

/**
 * Send an email using Gmail SMTP and provided passkey
 */
export async function sendEmailSMTP(
  to: string[],
  subject: string,
  plainText: string,
  html?: string
) {
  // Use environment variables for Gmail credentials
  const senderEmail = process.env.GMAIL_EMAIL;
  const pass = process.env.GMAIL_PASSKEY;

  if (!senderEmail || !pass) {
    throw new Error("Gmail credentials are not set in environment variables.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: pass,
    },
  });

  const mailOptions = {
    from: senderEmail,
    to,
    subject,
    text: plainText,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
