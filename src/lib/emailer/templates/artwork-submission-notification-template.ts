import { emailHeader } from '../components/Header';
import { emailFooter } from '../components/Footer';
import { commonEmailStyles } from '../components/CommonStyles';
import { ArtworkSubmissionNotificationData } from '../types';

export const generateArtworkSubmissionNotificationEmail = (data: ArtworkSubmissionNotificationData) => {
  const unsubscribeUrl = `https://friendshipcentergallery.org/admin/settings`;
  
  return `
${emailHeader}
${commonEmailStyles}
    <div class="email-body">
      <h1 style="color: #3b82f6; font-size: 28px; font-weight: 600; margin-bottom: 20px;">
        🎨 New Artwork Submission
      </h1>
      
      <p class="greeting-text">Hello Admin,</p>
      
      <p class="main-message">
        <strong>${data.artistName}</strong> has submitted a new artwork for review. 
        Please review and approve or reject this submission.
      </p>
      
      <div class="detail-container">
        <h2 class="detail-title">${data.artworkTitle}</h2>
        
        <div class="detail-row">
          <span class="detail-label">Artist:</span>
          <span class="detail-value">${data.artistName}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Artwork ID:</span>
          <span class="detail-value">#${data.artworkId}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Submitted:</span>
          <span class="detail-value">${data.submissionDate}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value" style="color: #f59e0b;">⏳ Pending Review</span>
        </div>
      </div>
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #1f2937;">Review Checklist</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
          <li>Image quality and resolution</li>
          <li>Artwork description completeness</li>
          <li>Pricing information accuracy</li>
          <li>Gallery guidelines compliance</li>
          <li>Artist profile completeness</li>
        </ul>
      </div>
      
      <div class="cta-section">
        <a href="${data.reviewUrl}" class="cta-button">
          Review Artwork Submission
        </a>
      </div>
      
      <p class="main-message">
        Once you've reviewed the artwork, you can approve it for publication or provide feedback for revisions.
      </p>
      
      <p class="signature-text">Gallery Admin System</p>
    </div>
${emailFooter.replace('{{unsubscribeUrl}}', unsubscribeUrl)}
  `;
};

