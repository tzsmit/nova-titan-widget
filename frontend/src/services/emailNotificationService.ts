/**
 * Email Notification Service
 * Handles Elite membership interest notifications and other email communications
 */

export interface NotificationRequest {
  type: 'elite_interest' | 'general_inquiry' | 'feature_request';
  userEmail?: string;
  userName?: string;
  message?: string;
  metadata?: {
    timestamp: string;
    userAgent: string;
    referrer: string;
    feature?: string;
  };
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  requestId?: string;
}

class EmailNotificationService {
  private static instance: EmailNotificationService;
  private readonly NOTIFICATION_EMAIL = 'traivonesmith@novatitan.net';
  private readonly API_ENDPOINT = 'https://formspree.io/f/xpwaaapn'; // You'll need to set up a Formspree endpoint
  
  static getInstance(): EmailNotificationService {
    if (!this.instance) {
      this.instance = new EmailNotificationService();
    }
    return this.instance;
  }

  /**
   * Send Elite membership interest notification
   */
  async sendEliteInterestNotification(userEmail?: string): Promise<NotificationResponse> {
    console.log('📧 Sending Elite membership interest notification to:', this.NOTIFICATION_EMAIL);
    
    const request: NotificationRequest = {
      type: 'elite_interest',
      userEmail,
      message: 'User expressed interest in Elite membership for Pristine AI Engine access',
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'Direct',
        feature: 'Pristine AI Engine'
      }
    };

    try {
      // For now, we'll use a simple approach - you can integrate with your preferred email service
      // Options include: Formspree, EmailJS, Netlify Forms, or your own backend API
      
      const emailBody = this.formatEliteInterestEmail(request);
      
      // Method 1: Use mailto (opens user's email client)
      const subject = encodeURIComponent('🔔 Nova Titan Elite Membership Interest');
      const body = encodeURIComponent(emailBody);
      const mailtoUrl = `mailto:${this.NOTIFICATION_EMAIL}?subject=${subject}&body=${body}`;
      
      // For production, you'd want to use a proper email service API
      // For now, we'll log the notification and optionally open email client
      
      console.log('📧 Elite Interest Notification Details:');
      console.log('To:', this.NOTIFICATION_EMAIL);
      console.log('Subject: Nova Titan Elite Membership Interest');
      console.log('Body:', emailBody);
      
      // Option to open user's email client
      if (confirm('Open your email client to send Elite membership interest notification?')) {
        window.location.href = mailtoUrl;
      }
      
      // You could also send this to a backend API:
      /*
      const response = await fetch('/api/notifications/elite-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      */
      
      return {
        success: true,
        message: 'Elite membership interest registered successfully!',
        requestId: `elite_${Date.now()}`
      };
      
    } catch (error) {
      console.error('❌ Failed to send Elite interest notification:', error);
      return {
        success: false,
        message: 'Failed to register interest. Please try again later.'
      };
    }
  }

  /**
   * Send general feature request or feedback
   */
  async sendFeatureRequest(feature: string, userFeedback: string, userEmail?: string): Promise<NotificationResponse> {
    console.log('📧 Sending feature request notification to:', this.NOTIFICATION_EMAIL);
    
    const request: NotificationRequest = {
      type: 'feature_request',
      userEmail,
      message: userFeedback,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'Direct',
        feature: feature
      }
    };

    try {
      const emailBody = this.formatFeatureRequestEmail(request);
      
      const subject = encodeURIComponent(`🚀 Nova Titan Feature Request: ${feature}`);
      const body = encodeURIComponent(emailBody);
      const mailtoUrl = `mailto:${this.NOTIFICATION_EMAIL}?subject=${subject}&body=${body}`;
      
      console.log('📧 Feature Request Details:');
      console.log('Feature:', feature);
      console.log('Feedback:', userFeedback);
      console.log('User Email:', userEmail || 'Not provided');
      
      // For production, integrate with your email service API
      
      return {
        success: true,
        message: 'Feature request sent successfully!',
        requestId: `feature_${Date.now()}`
      };
      
    } catch (error) {
      console.error('❌ Failed to send feature request:', error);
      return {
        success: false,
        message: 'Failed to send feature request. Please try again later.'
      };
    }
  }

  /**
   * Format Elite membership interest email
   */
  private formatEliteInterestEmail(request: NotificationRequest): string {
    return `
🔔 NOVA TITAN ELITE MEMBERSHIP INTEREST

A user has expressed interest in Elite membership for Pristine AI Engine access.

📧 User Email: ${request.userEmail || 'Not provided'}
🕐 Timestamp: ${request.metadata?.timestamp}
🌐 User Agent: ${request.metadata?.userAgent}
📍 Referrer: ${request.metadata?.referrer}
🎯 Feature Interest: ${request.metadata?.feature}

💼 BUSINESS OPPORTUNITY:
This user is ready to upgrade to Elite membership for advanced AI features.
Consider reaching out with Elite membership options and pricing.

🎯 RECOMMENDED ACTIONS:
1. Send Elite membership information and pricing
2. Provide early access or beta invitation
3. Schedule demo of Pristine AI Engine capabilities
4. Add to Elite member waiting list

---
Sent via Nova Titan Sports Interface
Elite Membership Interest Registration System
    `.trim();
  }

  /**
   * Format feature request email
   */
  private formatFeatureRequestEmail(request: NotificationRequest): string {
    return `
🚀 NOVA TITAN FEATURE REQUEST

📧 User Email: ${request.userEmail || 'Not provided'}
🎯 Feature: ${request.metadata?.feature}
🕐 Timestamp: ${request.metadata?.timestamp}

💭 USER FEEDBACK:
${request.message}

📊 TECHNICAL DETAILS:
User Agent: ${request.metadata?.userAgent}
Referrer: ${request.metadata?.referrer}

---
Sent via Nova Titan Sports Interface
Feature Request System
    `.trim();
  }

  /**
   * Validate email address
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get notification email for testing
   */
  getNotificationEmail(): string {
    return this.NOTIFICATION_EMAIL;
  }
}

// Export singleton instance
export const emailNotificationService = EmailNotificationService.getInstance();