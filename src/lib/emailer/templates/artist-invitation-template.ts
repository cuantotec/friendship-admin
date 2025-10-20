import { emailHeader } from '../components/Header';
import { emailFooter } from '../components/Footer';
import { commonEmailStyles } from '../components/CommonStyles';
import { ArtistInvitationData } from '../types';

export const generateArtistInvitationEmail = (data: ArtistInvitationData) => {
  const unsubscribeUrl = `https://friendshipcentergallery.org/unsubscribe/${data.artistEmail}`;
  
  return `
${emailHeader}
${commonEmailStyles}
    <div class="email-body">
      <h1 style="color: #1f2937; font-size: 28px; font-weight: 600; margin-bottom: 20px;">
        🎨 You're Invited to Join Our Gallery!
      </h1>
      
      <p class="greeting-text">Hello ${data.artistName},</p>
      
      <p class="main-message">
        ${data.adminName} has invited you to become an artist at The Friendship Center Gallery! 
        We're excited to showcase your work and help you connect with art enthusiasts in our community.
      </p>
      
      <div class="highlight-box">
        <div style="text-align: center; padding: 20px;">
          <h3 style="margin-top: 0; color: #1f2937; margin-bottom: 15px;">🎯 Your Account is Ready!</h3>
          <p style="margin: 0; color: #374151; font-size: 16px;">
            We've created your artist account using <strong>${data.artistEmail}</strong>
          </p>
        </div>
      </div>
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #1f2937;">How to Get Started:</h3>
        <ol style="margin: 10px 0; padding-left: 20px; color: #374151;">
          <li><strong>Set Your Password:</strong> Click "Forgot Password" on the login page</li>
          <li><strong>Check Your Email:</strong> Use the password reset link sent to ${data.artistEmail}</li>
          <li><strong>Create Your Profile:</strong> Set up your artist bio and specialty</li>
          <li><strong>Upload Artwork:</strong> Add your first pieces to the gallery</li>
        </ol>
      </div>
      
      <div class="cta-section">
        <a href="${data.baseUrl}/login" class="cta-button">
          Go to Login Page
        </a>
        <p style="text-align: center; margin-top: 15px; color: #6b7280; font-size: 14px;">
          Then click "Forgot Password" to set your password
        </p>
      </div>
      
      <div class="success-box">
        <h3 style="margin-top: 0; color: #059669;">✨ Gallery Benefits</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #065f46;">
          <li><strong>Personal Dashboard:</strong> Manage your artworks and profile</li>
          <li><strong>Featured Listings:</strong> Get your work in front of collectors</li>
          <li><strong>Direct Inquiries:</strong> Connect with interested buyers</li>
          <li><strong>Exhibition Opportunities:</strong> Participate in gallery events</li>
        </ul>
      </div>
      
      <p class="main-message">
        If you have any questions or need assistance setting up your account, please don't hesitate to reach out. 
        We're here to help you succeed!
      </p>
      
      <p class="closing-text">Welcome to our creative community!</p>
      <p class="signature-text">The Friendship Center Gallery Team</p>
    </div>
${emailFooter.replace('{{unsubscribeUrl}}', unsubscribeUrl)}
  `;
};

