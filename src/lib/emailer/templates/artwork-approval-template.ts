import { emailHeader } from '../components/Header';
import { emailFooter } from '../components/Footer';
import { commonEmailStyles } from '../components/CommonStyles';
import { ArtworkApprovalData } from '../types';

export const generateArtworkApprovalEmail = (data: ArtworkApprovalData) => {
  const unsubscribeUrl = `https://friendshipcentergallery.org/unsubscribe`;
  
  return `
${emailHeader}
${commonEmailStyles}
    <div class="email-body">
      <h1 style="color: #059669; font-size: 28px; font-weight: 600; margin-bottom: 20px;">
        ✅ Your Artwork Has Been Approved!
      </h1>
      
      <p class="greeting-text">Dear ${data.artistName},</p>
      
      <p class="main-message">
        Great news! Your artwork "<strong>${data.artworkTitle}</strong>" has been approved and is now live 
        on The Friendship Center Gallery website. Art enthusiasts can now view and inquire about your piece.
      </p>
      
      <div class="detail-container">
        <h2 class="detail-title">${data.artworkTitle}</h2>
        
        <div class="detail-row">
          <span class="detail-label">Artwork ID:</span>
          <span class="detail-value">#${data.artworkId}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Approved By:</span>
          <span class="detail-value">${data.approvedBy}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value" style="color: #059669;">✓ Published</span>
        </div>
      </div>
      
      <div class="success-box">
        <h3 style="margin-top: 0; color: #059669;">🎉 What This Means</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #065f46;">
          <li>Your artwork is now visible to all gallery visitors</li>
          <li>Collectors can view details and submit inquiries</li>
          <li>Your piece may be featured in gallery promotions</li>
          <li>You'll receive notifications for any inquiries</li>
        </ul>
      </div>
      
      <div class="cta-section">
        <a href="${data.publishedUrl}" class="cta-button">
          View Your Published Artwork
        </a>
      </div>
      
      <p class="main-message">
        Share this link with your network to help promote your work! The more visibility your artwork gets, 
        the more opportunities for connections and sales.
      </p>
      
      <p class="closing-text">Congratulations on your publication!</p>
      <p class="signature-text">The Friendship Center Gallery Team</p>
    </div>
${emailFooter.replace('{{unsubscribeUrl}}', unsubscribeUrl)}
  `;
};

