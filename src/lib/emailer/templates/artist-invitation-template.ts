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
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="highlight-label">Your Invitation Code:</span>
          <span class="highlight-value">${data.invitationCode}</span>
        </div>
      </div>
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #1f2937;">What's Next?</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
          <li>Click the button below to set up your artist account</li>
          <li>Create your artist profile with bio and specialty</li>
          <li>Upload your first artwork to the gallery</li>
          <li>Start connecting with art collectors and enthusiasts</li>
        </ul>
      </div>
      
      <div class="cta-section">
        <a href="${data.setupUrl}" class="cta-button">
          Set Up Your Artist Account
        </a>
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

