import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import express from "express";
import bodyParser from "body-parser";
import { databases } from "./lib/appwrite";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "./lib/constants";

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

// Notification settings API endpoints
app.get("/notification-settings/:workspaceId", async (req, res) => {
  const workspaceId = req.params.workspaceId;
  if (!workspaceId) {
    return res.status(400).json({ error: "Workspace ID is required" });
  }
  try {
    const workspace = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.WORKSPACES,
      workspaceId
    );
    let settings = {};
    try {
      settings = (workspace as any).settings
        ? JSON.parse((workspace as any).settings)
        : {};
    } catch {
      settings = (workspace as any).settings || {};
    }
    res.json({
      success: true,
      settings: (settings as any).notifications || {},
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch workspace notification settings" });
  }
});

app.patch("/notification-settings/:workspaceId", async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const { notifications } = req.body;
  if (!workspaceId || !notifications) {
    return res
      .status(400)
      .json({ error: "Workspace ID and notifications are required" });
  }
  try {
    const workspace = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.WORKSPACES,
      workspaceId
    );
    let settings = {};
    try {
      settings = (workspace as any).settings
        ? JSON.parse((workspace as any).settings)
        : {};
    } catch {
      settings = (workspace as any).settings || {};
    }
    (settings as any).notifications = notifications;
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.WORKSPACES,
      workspaceId,
      { settings: JSON.stringify(settings) }
    );
    res.json({ success: true, settings: notifications });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update workspace notification settings" });
  }
});

// Notification trigger endpoints
app.post("/notify/flow-failure", async (req, res) => {
  const { workspaceId, flowName, error } = req.body;
  if (!workspaceId || !flowName || !error) {
    return res
      .status(400)
      .json({ error: "workspaceId, flowName, and error are required" });
  }
  try {
    await notifyFlowFailure(workspaceId, flowName, error);
    res.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMessage });
  }
});

app.post("/notify/high-event-volume", async (req, res) => {
  const { workspaceId, eventCount, threshold } = req.body;
  if (
    !workspaceId ||
    typeof eventCount !== "number" ||
    typeof threshold !== "number"
  ) {
    return res
      .status(400)
      .json({ error: "workspaceId, eventCount, and threshold are required" });
  }
  try {
    await notifyHighEventVolume(workspaceId, eventCount, threshold);
    res.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMessage });
  }
});

app.post("/notify/weekly-report", async (req, res) => {
  const { workspaceId, reportData } = req.body;
  if (!workspaceId || !reportData) {
    return res
      .status(400)
      .json({ error: "workspaceId and reportData are required" });
  }
  try {
    await sendWeeklyReport(workspaceId, reportData);
    res.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMessage });
  }
});

// Check event volume and notify if threshold exceeded
app.post("/check-event-volume", async (req, res) => {
  const { workspaceId } = req.body;
  if (!workspaceId) {
    return res.status(400).json({ error: "workspaceId is required" });
  }
  try {
    const settings = await getNotificationSettings(workspaceId);
    const threshold =
      settings.email?.eventVolume?.threshold ||
      settings.inApp?.eventVolume?.threshold ||
      settings.webhook?.eventVolume?.threshold ||
      1000;

    // Count events in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const events = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.EVENTS,
      [`workspaceId=${workspaceId}`, `createdAt>${oneHourAgo}`]
    );

    const eventCount = events.documents.length;

    if (eventCount >= threshold) {
      await notifyHighEventVolume(workspaceId, eventCount, threshold);
    }

    res.json({ success: true, eventCount, threshold });
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

/**
 * Get notification settings for a workspace
 */
async function getNotificationSettings(workspaceId: string) {
  try {
    const workspace = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.WORKSPACES,
      workspaceId
    );
    let settings = {};
    try {
      settings = (workspace as any).settings
        ? JSON.parse((workspace as any).settings)
        : {};
    } catch {
      settings = (workspace as any).settings || {};
    }
    return (settings as any).notifications || {};
  } catch (err) {
    console.error("Failed to get notification settings:", err);
    return {};
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(
  workspaceId: string,
  subject: string,
  message: string,
  html?: string
) {
  const settings = await getNotificationSettings(workspaceId);
  const emailSettings = settings.email;

  if (!emailSettings?.enabled || !emailSettings.recipients?.length) {
    return;
  }

  try {
    await sendEmailSMTP(emailSettings.recipients, subject, message, html);
    console.log("Email notification sent to:", emailSettings.recipients);
  } catch (err) {
    console.error("Failed to send email notification:", err);
  }
}

/**
 * Send in-app notification
 */
async function sendInAppNotification(
  workspaceId: string,
  title: string,
  message: string,
  type: "info" | "warning" | "error" | "success" = "info"
) {
  const settings = await getNotificationSettings(workspaceId);
  const inAppSettings = settings.inApp;

  if (!inAppSettings?.enabled) {
    return;
  }

  try {
    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.NOTIFICATIONS,
      "unique()", // auto-generate ID
      {
        workspaceId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
      }
    );
    console.log("In-app notification created");
  } catch (err) {
    console.error("Failed to create in-app notification:", err);
  }
}

/**
 * Send webhook notification
 */
async function sendWebhookNotification(workspaceId: string, payload: any) {
  const settings = await getNotificationSettings(workspaceId);
  const webhookSettings = settings.webhook;

  if (!webhookSettings?.enabled || !webhookSettings.url) {
    return;
  }

  try {
    const response = await fetch(webhookSettings.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }

    console.log("Webhook notification sent");
  } catch (err) {
    console.error("Failed to send webhook notification:", err);
  }
}

/**
 * Send notification for flow failure
 */
export async function notifyFlowFailure(
  workspaceId: string,
  flowName: string,
  error: string
) {
  const settings = await getNotificationSettings(workspaceId);

  const subject = `Flow Failure: ${flowName}`;
  const message = `Flow "${flowName}" has failed with error: ${error}`;

  // Email
  if (settings.email?.enabled && settings.email.flowFailures) {
    await sendEmailNotification(workspaceId, subject, message);
  }

  // In-app
  if (settings.inApp?.enabled && settings.inApp.flowFailures) {
    await sendInAppNotification(workspaceId, subject, message, "error");
  }

  // Webhook
  if (settings.webhook?.enabled && settings.webhook.flowFailures) {
    await sendWebhookNotification(workspaceId, {
      type: "flow_failure",
      flowName,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Send notification for high event volume
 */
export async function notifyHighEventVolume(
  workspaceId: string,
  eventCount: number,
  threshold: number
) {
  const settings = await getNotificationSettings(workspaceId);

  const subject = `High Event Volume Alert`;
  const message = `Event volume has exceeded threshold: ${eventCount} events (threshold: ${threshold})`;

  // Email
  if (settings.email?.enabled && settings.email.eventVolume?.enabled) {
    await sendEmailNotification(workspaceId, subject, message);
  }

  // In-app
  if (settings.inApp?.enabled && settings.inApp.eventVolume?.enabled) {
    await sendInAppNotification(workspaceId, subject, message, "warning");
  }

  // Webhook
  if (settings.webhook?.enabled && settings.webhook.eventVolume?.enabled) {
    await sendWebhookNotification(workspaceId, {
      type: "high_event_volume",
      eventCount,
      threshold,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Send weekly report
 */
export async function sendWeeklyReport(workspaceId: string, reportData: any) {
  const settings = await getNotificationSettings(workspaceId);

  const subject = `Weekly Report - ${new Date().toLocaleDateString()}`;
  const message = `Weekly analytics report:\n${JSON.stringify(
    reportData,
    null,
    2
  )}`;

  // Email
  if (settings.email?.enabled && settings.email.weeklyReports) {
    await sendEmailNotification(workspaceId, subject, message);
  }

  // In-app
  if (settings.inApp?.enabled && settings.inApp.weeklyReports) {
    await sendInAppNotification(workspaceId, subject, message, "info");
  }

  // Webhook
  if (settings.webhook?.enabled && settings.webhook.weeklyReports) {
    await sendWebhookNotification(workspaceId, {
      type: "weekly_report",
      reportData,
      timestamp: new Date().toISOString(),
    });
  }
}
