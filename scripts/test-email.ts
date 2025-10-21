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

  // Test 2: Artwork Approval
  console.log('📧 Test 2: Sending artwork approval email...');
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

  // Test 3: Artwork Rejection
  console.log('📧 Test 3: Sending artwork rejection email...');
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

  // Test 4: Admin Notification
  console.log('📧 Test 4: Sending admin notification...');
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

