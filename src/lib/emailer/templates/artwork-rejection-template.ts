import { emailHeader } from '../components/Header';
import { emailFooter } from '../components/Footer';
import { commonEmailStyles } from '../components/CommonStyles';
import { ArtworkRejectionData } from '../types';

export const generateArtworkRejectionEmail = (data: ArtworkRejectionData) => {
  const unsubscribeUrl = `https://friendshipcentergallery.org/unsubscribe`;
  
  return `
${emailHeader}
${commonEmailStyles}
    <div class="email-body">
      <h1 style="color: #dc2626; font-size: 28px; font-weight: 600; margin-bottom: 20px;">
        Artwork Submission Update
      </h1>
      
      <p class="greeting-text">Dear ${data.artistName},</p>
      
      <p class="main-message">
        Thank you for submitting "<strong>${data.artworkTitle}</strong>" to The Friendship Center Gallery. 
        After careful review, we're unable to approve this piece for publication at this time.
      </p>
      
      <div class="detail-container">
        <h2 class="detail-title">${data.artworkTitle}</h2>
        
        <div class="detail-row">
          <span class="detail-label">Artwork ID:</span>
          <span class="detail-value">#${data.artworkId}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value" style="color: #dc2626;">Not Approved</span>
        </div>
      </div>
      
      <div class="warning-box">
        <h3 style="margin-top: 0; color: #d97706;">Reason for Decision</h3>
        <p style="margin: 10px 0; color: #92400e; line-height: 1.6;">
          ${data.rejectionReason}
        </p>
      </div>
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #1f2937;">What You Can Do Next</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
          <li>Review the feedback and make necessary adjustments</li>
          <li>Resubmit your artwork with improvements</li>
          <li>Contact us if you have questions about the decision</li>
          <li>Submit a different piece for consideration</li>
        </ul>
      </div>
      
      <p class="main-message">
        We encourage you to continue creating and sharing your work. This decision doesn't reflect on your talent 
        as an artist—it's simply about finding the right fit for our current gallery focus.
      </p>
      
      <div class="cta-section">
        <a href="mailto:${data.adminContact}" class="primary-button">
          Contact Us About This Decision
        </a>
      </div>
      
      <p class="closing-text">We appreciate your understanding and look forward to your future submissions.</p>
      <p class="signature-text">The Friendship Center Gallery Team</p>
    </div>
${emailFooter.replace('{{unsubscribeUrl}}', unsubscribeUrl)}
  `;
};

