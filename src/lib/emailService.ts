/**
 * Transactional Email Service via Resend
 * Supports:
 * 1. User Registration Confirmation Email
 * 2. Project Submission & Tracking ID Email
 * 3. Project Status Update & Approval Email
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || "";
const FROM_EMAIL = "BuildWave <notifications@buildwave.com>";

export const sendEmail = async ({ to, subject, html }: SendEmailParams): Promise<boolean> => {
  if (!to || !to.includes("@")) {
    console.warn("Invalid email address provided for notification:", to);
    return false;
  }

  // If Resend API Key is available, dispatch via Resend REST API
  if (RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Resend Email API error:", errorData);
        return false;
      }

      console.log(`✅ Transactional email successfully sent to ${to}`);
      return true;
    } catch (err) {
      console.error("Failed to send email via Resend API:", err);
      return false;
    }
  }

  // Fallback log when no API key configured (Local Dev Mode)
  console.log(`[Email Service Simulation] -> To: ${to} | Subject: "${subject}"`);
  return true;
};

/**
 * 1. User Welcome & Registration Email
 */
export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  const subject = "Welcome to BuildWave - Academic Project Assistance";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 24px; border-radius: 8px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to BuildWave 🚀</h1>
        <p style="margin-top: 8px; opacity: 0.9;">Your academic execution partner</p>
      </div>
      
      <div style="padding: 24px 0; color: #334155; line-height: 1.6;">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Thank you for registering with BuildWave! We are excited to support you through your research, writing, software, and engineering academic projects.</p>
        
        <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #1e293b;">What you can do next:</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Submit a new project request with your topic and guidelines.</li>
            <li>Track real-time progress & communicate directly with assigned tutors.</li>
            <li>Download project deliverables directly from your student dashboard.</li>
          </ul>
        </div>

        <p>If you have any questions, our support team is available 24/7 on WhatsApp and email.</p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} BuildWave Academic Solutions. All rights reserved.
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

/**
 * 2. Project Creation & Tracking ID Email
 */
export const sendProjectCreatedEmail = async (
  userEmail: string,
  userName: string,
  projectId: string,
  projectTitle: string,
  deadline?: string
) => {
  const subject = `Project Request Submitted [Tracking ID: ${projectId}]`;
  const trackUrl = `${window.location.origin}/track/${projectId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; border-radius: 8px; text-align: center; color: white;">
        <h2 style="margin: 0;">Project Request Received</h2>
        <p style="margin-top: 8px; opacity: 0.9;">Tracking ID: <strong>${projectId}</strong></p>
      </div>

      <div style="padding: 24px 0; color: #334155; line-height: 1.6;">
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Your project request has been successfully registered on the BuildWave platform.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Project Title:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${projectTitle}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Tracking ID:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-mono;">${projectId}</td>
          </tr>
          ${
            deadline
              ? `<tr>
                  <td style="padding: 12px; font-weight: bold;">Deadline:</td>
                  <td style="padding: 12px;">${deadline}</td>
                </tr>`
              : ""
          }
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${trackUrl}" style="background: #4f46e5; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Track Project Progress
          </a>
        </div>

        <p style="font-size: 13px; color: #64748b;">An academic tutor will review your project details and update your progress shortly.</p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} BuildWave Academic Solutions.
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

/**
 * 3. Project Status Update / Approval Email
 */
export const sendProjectStatusUpdateEmail = async (
  userEmail: string,
  userName: string,
  projectId: string,
  projectTitle: string,
  newStatus: string,
  note?: string
) => {
  const subject = `Project Status Update: ${projectTitle} (${newStatus})`;
  const trackUrl = `${window.location.origin}/track/${projectId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="background: #0f172a; padding: 24px; border-radius: 8px; text-align: center; color: white;">
        <h2 style="margin: 0;">Project Update Notification</h2>
        <p style="margin-top: 8px; color: #38bdf8;">Status: <strong>${newStatus}</strong></p>
      </div>

      <div style="padding: 24px 0; color: #334155; line-height: 1.6;">
        <p>Dear <strong>${userName}</strong>,</p>
        <p>There is an update on your project <strong>${projectTitle}</strong> (ID: <code>${projectId}</code>).</p>
        
        ${
          note
            ? `<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e3a8a; font-style: italic;">"${note}"</p>
              </div>`
            : ""
        }

        <div style="text-align: center; margin: 30px 0;">
          <a href="${trackUrl}" style="background: #0284c7; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Details & Deliverables
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
};
