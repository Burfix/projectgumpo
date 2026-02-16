import { Resend } from 'resend';

// Initialize Resend with fallback to avoid build errors
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type EmailTemplate = 'incident' | 'message' | 'daily_summary';

interface IncidentEmailData {
  parentName: string;
  childName: string;
  incidentType: string;
  severity: string;
  description: string;
  actionTaken?: string;
  time: string;
  teacherName?: string;
}

interface MessageEmailData {
  recipientName: string;
  senderName: string;
  subject: string;
  messagePreview: string;
  dashboardUrl: string;
}

interface DailySummaryEmailData {
  parentName: string;
  childName: string;
  date: string;
  attendance: {
    checkIn: string;
    checkOut?: string;
  };
  meals: { type: string; amount: string }[];
  naps: { start: string; duration?: number }[];
  activities: { type: string; description: string }[];
  incidents: { type: string; severity: string }[];
}

/**
 * Send an incident notification email to parents
 */
export async function sendIncidentEmail(
  to: string,
  data: IncidentEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!resend) {
      console.warn('Resend API key not configured. Email notifications disabled.');
      return { success: false, error: 'Email service not configured' };
    }

    const { data: email, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Gumpo <notifications@gumpo.app>',
      to,
      subject: `⚠️ Incident Report: ${data.childName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Incident Report</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
              .content { padding: 30px; }
              .severity-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 15px; }
              .severity-minor { background-color: #fef3c7; color: #92400e; }
              .severity-moderate { background-color: #fed7aa; color: #9a3412; }
              .severity-serious { background-color: #fecaca; color: #991b1b; }
              .info-row { margin-bottom: 20px; }
              .info-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
              .info-value { font-size: 15px; color: #111827; }
              .description-box { background-color: #f9fafb; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
              .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 15px; }
              .button:hover { background-color: #059669; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Incident Report</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">For ${data.childName}</p>
              </div>
              <div class="content">
                <p>Dear ${data.parentName},</p>
                <p>We want to inform you about an incident involving ${data.childName}:</p>
                
                <div class="severity-badge severity-${data.severity}">
                  ${data.severity} incident
                </div>
                
                <div class="info-row">
                  <div class="info-label">Type</div>
                  <div class="info-value">${data.incidentType}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Time</div>
                  <div class="info-value">${data.time}</div>
                </div>
                
                <div class="description-box">
                  <div class="info-label">What Happened</div>
                  <div class="info-value">${data.description}</div>
                </div>
                
                ${data.actionTaken ? `
                  <div class="info-row">
                    <div class="info-label">Action Taken</div>
                    <div class="info-value">${data.actionTaken}</div>
                  </div>
                ` : ''}
                
                ${data.teacherName ? `
                  <div class="info-row">
                    <div class="info-label">Reported By</div>
                    <div class="info-value">${data.teacherName}</div>
                  </div>
                ` : ''}
                
                <p style="margin-top: 25px;">View full details and any attached photos in your dashboard:</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/parent" class="button">
                  View in Dashboard →
                </a>
              </div>
              <div class="footer">
                <p>If you have any concerns, please contact us directly.</p>
                <p style="margin-top: 10px; font-size: 12px;">© ${new Date().getFullYear()} Gumpo. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending incident email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending incident email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a message notification email
 */
export async function sendMessageEmail(
  to: string,
  data: MessageEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data: email, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Gumpo <notifications@gumpo.app>',
      to,
      subject: `💬 New Message: ${data.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .message-box { background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 15px; }
              .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💬 New Message</h1>
              </div>
              <div class="content">
                <p>Hi ${data.recipientName},</p>
                <p>You have a new message from <strong>${data.senderName}</strong>:</p>
                <div class="message-box">
                  <strong>${data.subject}</strong>
                  <p style="margin: 10px 0 0 0; color: #6b7280;">${data.messagePreview}</p>
                </div>
                <a href="${data.dashboardUrl}" class="button">Read Full Message →</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Gumpo. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Send a daily summary email to parents
 */
export async function sendDailySummaryEmail(
  to: string,
  data: DailySummaryEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data: email, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Gumpo <notifications@gumpo.app>',
      to,
      subject: `📊 Daily Summary: ${data.childName} - ${data.date}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .section { margin-bottom: 25px; }
              .section-title { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 10px; display: flex; align-items: center; }
              .section-title span { margin-right: 8px; }
              .item { background-color: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 6px; font-size: 14px; }
              .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Daily Summary</h1>
                <p style="margin: 5px 0 0 0;">${data.childName} - ${data.date}</p>
              </div>
              <div class="content">
                <p>Hi ${data.parentName},</p>
                <p>Here's what ${data.childName} did today:</p>
                
                <div class="section">
                  <div class="section-title"><span>🚪</span> Attendance</div>
                  <div class="item">Checked in: ${data.attendance.checkIn}</div>
                  ${data.attendance.checkOut ? `<div class="item">Checked out: ${data.attendance.checkOut}</div>` : ''}
                </div>
                
                ${data.meals.length > 0 ? `
                  <div class="section">
                    <div class="section-title"><span>🍽️</span> Meals (${data.meals.length})</div>
                    ${data.meals.map(meal => `<div class="item">${meal.type}: ${meal.amount}</div>`).join('')}
                  </div>
                ` : ''}
                
                ${data.naps.length > 0 ? `
                  <div class="section">
                    <div class="section-title"><span>😴</span> Naps (${data.naps.length})</div>
                    ${data.naps.map(nap => `<div class="item">Started: ${nap.start}${nap.duration ? ` (${nap.duration} min)` : ''}</div>`).join('')}
                  </div>
                ` : ''}
                
                ${data.activities.length > 0 ? `
                  <div class="section">
                    <div class="section-title"><span>🎨</span> Activities (${data.activities.length})</div>
                    ${data.activities.map(activity => `<div class="item"><strong>${activity.type}</strong>: ${activity.description}</div>`).join('')}
                  </div>
                ` : ''}
                
                ${data.incidents.length > 0 ? `
                  <div class="section">
                    <div class="section-title"><span>⚠️</span> Incidents (${data.incidents.length})</div>
                    ${data.incidents.map(incident => `<div class="item">${incident.type} (${incident.severity})</div>`).join('')}
                  </div>
                ` : ''}
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Gumpo. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
