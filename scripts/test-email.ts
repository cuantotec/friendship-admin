#!/usr/bin/env node

/**
 * Test script for the email system
 * 
 * Usage:
 *   npx tsx scripts/test-email.ts
 * 
 * Make sure to set RESEND_API_KEY in your .env.local before running
 */

import { 
  sendEmail, 
  sendArtistInvitation,
  sendArtistWelcome,
  sendArtworkApproval,
  sendArtworkRejection,
  sendArtworkSubmissionNotification
} from '../src/lib/emailer';

// Test recipient - change this to your email for testing
const TEST_EMAIL = 'test@example.com';
const TEST_NAME = 'Test User';

async function runTests() {
  console.log('🧪 Testing Email System\n');
  
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    console.log('Please add RESEND_API_KEY to your .env.local file\n');
    process.exit(1);
  }

  console.log('✅ RESEND_API_KEY found\n');

  // Test 1: Basic Email
  console.log('📧 Test 1: Sending basic email...');
  const basicResult = await sendEmail({
    to: { email: TEST_EMAIL, name: TEST_NAME },
    subject: 'Test Email - Friendship Gallery Admin',
    html: '<h1>✅ Email System is Working!</h1><p>This is a test email from the Friendship Gallery Admin.</p>',
  });

  if (basicResult.success) {
    console.log('✅ Basic email sent successfully!', basicResult.messageId, '\n');
  } else {
    console.error('❌ Failed to send basic email:', basicResult.error, '\n');
  }

  // Test 2: Artist Invitation
  console.log('📧 Test 2: Sending artist invitation email...');
  const invitationResult = await sendArtistInvitation({
    artistName: TEST_NAME,
    artistEmail: TEST_EMAIL,
    invitationCode: 'TEST-INVITE-123',
    adminName: 'Gallery Admin',
    setupUrl: 'http://localhost:3002/setup?code=TEST-INVITE-123'
  });

  if (invitationResult.success) {
    console.log('✅ Artist invitation sent successfully!', invitationResult.messageId, '\n');
  } else {
    console.error('❌ Failed to send invitation:', invitationResult.error, '\n');
  }

  // Test 3: Artist Welcome
  console.log('📧 Test 3: Sending artist welcome email...');
  const welcomeResult = await sendArtistWelcome({
    artistName: TEST_NAME,
    artistEmail: TEST_EMAIL,
    dashboardUrl: 'http://localhost:3002/dashboard',
    supportEmail: 'eliran@cuantotec.com'
  });

  if (welcomeResult.success) {
    console.log('✅ Artist welcome sent successfully!', welcomeResult.messageId, '\n');
  } else {
    console.error('❌ Failed to send welcome:', welcomeResult.error, '\n');
  }

  // Test 4: Artwork Approval
  console.log('📧 Test 4: Sending artwork approval email...');
  const approvalResult = await sendArtworkApproval({
    artistName: TEST_NAME,
    artworkTitle: 'Test Artwork - Sunset Dreams',
    artworkId: '12345',
    approvedBy: 'Gallery Admin',
    publishedUrl: 'https://friendshipcentergallery.org/artwork/test-artwork'
  });

  if (approvalResult.success) {
    console.log('✅ Artwork approval sent successfully!', approvalResult.messageId, '\n');
  } else {
    console.error('❌ Failed to send approval:', approvalResult.error, '\n');
  }

  // Test 5: Artwork Rejection
  console.log('📧 Test 5: Sending artwork rejection email...');
  const rejectionResult = await sendArtworkRejection({
    artistName: TEST_NAME,
    artworkTitle: 'Test Artwork - Abstract Piece',
    artworkId: '12346',
    rejectionReason: 'This is a test rejection. In a real scenario, we would provide specific feedback about image quality, composition, or gallery fit.',
    adminContact: 'eliran@cuantotec.com'
  });

  if (rejectionResult.success) {
    console.log('✅ Artwork rejection sent successfully!', rejectionResult.messageId, '\n');
  } else {
    console.error('❌ Failed to send rejection:', rejectionResult.error, '\n');
  }

  // Test 6: Admin Notification
  console.log('📧 Test 6: Sending admin notification...');
  const notificationResult = await sendArtworkSubmissionNotification({
    artistName: TEST_NAME,
    artworkTitle: 'Test Artwork - New Submission',
    artworkId: '12347',
    submissionDate: new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }),
    reviewUrl: 'http://localhost:3002/admin/review/12347'
  });

  if (notificationResult.success) {
    console.log('✅ Admin notification sent successfully!', notificationResult.messageId, '\n');
  } else {
    console.error('❌ Failed to send notification:', notificationResult.error, '\n');
  }

  // Summary
  console.log('=' .repeat(50));
  console.log('📊 Test Summary');
  console.log('=' .repeat(50));
  
  const results = [
    basicResult,
    invitationResult,
    welcomeResult,
    approvalResult,
    rejectionResult,
    notificationResult
  ];
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successCount}/${results.length}`);
  console.log(`❌ Failed: ${failCount}/${results.length}`);
  
  if (successCount === results.length) {
    console.log('\n🎉 All tests passed! Email system is fully functional.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

// Run the tests
runTests().catch(console.error);

