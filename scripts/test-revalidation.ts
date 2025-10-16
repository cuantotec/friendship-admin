/**
 * Test script for revalidation functionality
 * This script tests the revalidation API calls to the main site
 */

import { triggerRevalidation, revalidationPatterns } from '../src/lib/revalidation';

async function testRevalidation() {
  console.log('🧪 Testing revalidation functionality...\n');

  // Test 1: Basic revalidation with paths and tags
  console.log('Test 1: Basic revalidation with custom paths and tags');
  try {
    const result = await triggerRevalidation({
      paths: ['/', '/artwork', '/artists'],
      tags: ['artwork', 'artists']
    });
    console.log('✅ Success:', result);
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Artwork revalidation pattern
  console.log('Test 2: Artwork revalidation pattern');
  try {
    const result = await revalidationPatterns.artwork();
    console.log('✅ Success:', result);
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Artists revalidation pattern
  console.log('Test 3: Artists revalidation pattern');
  try {
    const result = await revalidationPatterns.artists();
    console.log('✅ Success:', result);
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Specific artwork revalidation
  console.log('Test 4: Specific artwork revalidation');
  try {
    const result = await revalidationPatterns.artworkById('123');
    console.log('✅ Success:', result);
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: All revalidation
  console.log('Test 5: All revalidation');
  try {
    const result = await revalidationPatterns.all();
    console.log('✅ Success:', result);
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n🎉 Revalidation testing completed!');
}

// Run the test
testRevalidation().catch(console.error);
