import { emailHeader } from '../components/Header';
import { emailFooter } from '../components/Footer';
import { commonEmailStyles } from '../components/CommonStyles';
import { ArtistWelcomeData } from '../types';

export const generateArtistWelcomeEmail = (data: ArtistWelcomeData) => {
  const unsubscribeUrl = `https://friendshipcentergallery.org/unsubscribe/${data.artistEmail}`;
  
  return `
${emailHeader}
${commonEmailStyles}
    <div class="email-body">
      <h1 style="color: #3b82f6; font-size: 28px; font-weight: 600; margin-bottom: 20px;">
        🎉 Welcome to The Friendship Center Gallery!
      </h1>
      
      <p class="greeting-text">Hello ${data.artistName},</p>
      
      <p class="main-message">
        Welcome to our creative community! Your artist account has been successfully set up, and you're now 
        ready to start showcasing your work to art enthusiasts and collectors.
      </p>
      
      <div class="success-box">
        <h3 style="margin-top: 0; color: #059669;">🚀 Getting Started</h3>
        <p style="margin: 10px 0; color: #065f46;">
          Here's what you can do right away:
        </p>
        <ul style="margin: 10px 0; padding-left: 20px; color: #065f46;">
          <li><strong>Complete Your Profile:</strong> Add your bio, specialty, and exhibition history</li>
          <li><strong>Upload Artwork:</strong> Share your creations with our community</li>
          <li><strong>Manage Settings:</strong> Control your visibility and preferences</li>
          <li><strong>Track Inquiries:</strong> Respond to collector questions</li>
        </ul>
      </div>
      
      <div class="cta-section">
        <a href="${data.dashboardUrl}" class="cta-button">
          Go to Your Dashboard
        </a>
      </div>
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #1f2937;">📚 Helpful Resources</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
          <li><strong>Artist Guidelines:</strong> Best practices for uploading artwork</li>
          <li><strong>Photo Tips:</strong> How to photograph your work professionally</li>
          <li><strong>Profile Optimization:</strong> Make your artist page stand out</li>
          <li><strong>Support Center:</strong> FAQs and tutorials</li>
        </ul>
      </div>
      
      <div class="detail-container">
        <h2 class="detail-title">Your Account Details</h2>
        
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${data.artistEmail}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Dashboard:</span>
          <span class="detail-value">
            <a href="${data.dashboardUrl}" style="color: #3b82f6; text-decoration: none;">
              Access Dashboard
            </a>
          </span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Support:</span>
          <span class="detail-value">
            <a href="mailto:${data.supportEmail}" style="color: #3b82f6; text-decoration: none;">
              ${data.supportEmail}
            </a>
          </span>
        </div>
      </div>
      
      <p class="main-message">
        We're thrilled to have you as part of our gallery family. If you have any questions or need assistance, 
        our support team is always here to help you succeed.
      </p>
      
      <p class="closing-text">Happy creating!</p>
      <p class="signature-text">The Friendship Center Gallery Team</p>
    </div>
${emailFooter.replace('{{unsubscribeUrl}}', unsubscribeUrl)}
  `;
};

