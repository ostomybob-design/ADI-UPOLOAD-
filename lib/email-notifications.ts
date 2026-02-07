import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'ostomybob@gmail.com';

interface EmailNotification {
  type: 'no-posts-available' | 'post-failed' | 'away-mode-auto-approval' | 'insufficient-posts';
  data: any;
}

export async function sendNotificationEmail(notification: EmailNotification) {
  try {
    let subject = '';
    let html = '';

    switch (notification.type) {
      case 'no-posts-available':
        subject = '⚠️ No Posts Available for Scheduled Slot';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ No Posts Available</h2>
            <p>Late.dev tried to schedule a post but there are no approved posts available in your queue.</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Next Queue Slot:</strong> ${notification.data.nextSlot || 'Unknown'}</p>
              <p><strong>Approved Posts Available:</strong> ${notification.data.approvedCount || 0}</p>
              <p><strong>Pending Posts:</strong> ${notification.data.pendingCount || 0}</p>
            </div>
            <p><strong>Action Needed:</strong></p>
            <ul>
              <li>Approve some pending posts, or</li>
              <li>Create new posts in your dashboard</li>
            </ul>
            <p>
              <a href="https://ostomybuddy-dashboard.vercel.app/dashboard" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to Dashboard
              </a>
            </p>
          </div>
        `;
        break;

      case 'post-failed':
        subject = '❌ Post Failed to Publish';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">❌ Post Publishing Failed</h2>
            <p>A scheduled post failed to publish to social media.</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
              <p><strong>Post ID:</strong> ${notification.data.postId}</p>
              <p><strong>Title:</strong> ${notification.data.title?.substring(0, 100)}...</p>
              <p><strong>Platform:</strong> ${notification.data.platform || 'Multiple'}</p>
              <p><strong>Error:</strong> ${notification.data.error || 'Unknown error'}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p><strong>What to do:</strong></p>
            <ul>
              <li>Check your Late.dev connected accounts</li>
              <li>Verify platform permissions</li>
              <li>Try rescheduling the post manually</li>
            </ul>
            <p>
              <a href="https://ostomybuddy-dashboard.vercel.app/dashboard" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Post
              </a>
            </p>
          </div>
        `;
        break;

      case 'away-mode-auto-approval':
        subject = '🤖 Away Mode: Posts Auto-Approved';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">🤖 Away Mode Auto-Approval</h2>
            <p>Your system automatically approved posts to keep your queue filled while you're away.</p>
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
              <p><strong>Date:</strong> ${new Date(notification.data.awayDate).toLocaleDateString()}</p>
              <p><strong>Posts Auto-Approved:</strong> ${notification.data.count}</p>
              <p><strong>Scheduled For:</strong> ${new Date(notification.data.scheduledFor).toLocaleString()}</p>
            </div>
            <p>These were the oldest pending posts in your queue. You may want to review them when you return.</p>
            <p>
              <a href="https://ostomybuddy-dashboard.vercel.app/dashboard" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Posts
              </a>
            </p>
          </div>
        `;
        break;

      case 'insufficient-posts':
        subject = '⚠️ Insufficient Posts for Away Days';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ Not Enough Posts for Away Days</h2>
            <p>You have away days scheduled, but there aren't enough posts available to cover them.</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
              <p><strong>Away Days Set:</strong> ${notification.data.awayDaysCount}</p>
              <p><strong>Approved Posts:</strong> ${notification.data.approvedCount}</p>
              <p><strong>Pending Posts:</strong> ${notification.data.pendingCount}</p>
              <p><strong>Total Available:</strong> ${notification.data.approvedCount + notification.data.pendingCount}</p>
            </div>
            <p><strong>Action Needed:</strong></p>
            <ul>
              <li>Create more posts before your away days</li>
              <li>Approve some pending posts</li>
              <li>The system will auto-approve as needed, but you may run out</li>
            </ul>
            <p>
              <a href="https://ostomybuddy-dashboard.vercel.app/dashboard" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Add More Posts
              </a>
            </p>
          </div>
        `;
        break;
    }

    const { data, error } = await resend.emails.send({
      from: 'Ostomy Dashboard <notifications@resend.dev>',
      to: [NOTIFICATION_EMAIL],
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send notification email:', error);
      return { success: false, error };
    }

    console.log('✅ Notification email sent:', subject);
    return { success: true, data };

  } catch (error) {
    console.error('Error sending notification email:', error);
    return { success: false, error };
  }
}
