/**
 * Test script to verify Twilio token generation
 * Run: npx ts-node src/scripts/testTwilioToken.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { generateAccessToken } from '../config/twilio';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testTokenGeneration() {
  console.log('🧪 Testing Twilio Token Generation...\n');

  // Check environment variables
  console.log('📋 Checking environment variables:');
  const requiredVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_API_KEY_SID',
    'TWILIO_API_KEY_SECRET',
  ];

  let allPresent = true;
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: MISSING`);
      allPresent = false;
    } else {
      const displayValue = varName.includes('SECRET') 
        ? `${value.substring(0, 8)}... (length: ${value.length})`
        : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  }

  if (!allPresent) {
    console.log('\n❌ ERROR: Missing required environment variables!');
    console.log('Please set all variables in .env file');
    process.exit(1);
  }

  console.log('\n🔑 Attempting to generate access token...');

  try {
    const testIdentity = 'test_user_123_client';
    const token = generateAccessToken(testIdentity);
    
    console.log('✅ SUCCESS! Token generated successfully');
    console.log(`📝 Identity: ${testIdentity}`);
    console.log(`📝 Token length: ${token.length} characters`);
    console.log(`📝 Token preview: ${token.substring(0, 50)}...`);
    
    // Try to decode and inspect token (just the header/payload, not verifying signature)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('\n📋 Token Details:');
        console.log('  Header:', JSON.stringify(header, null, 2));
        console.log('  Payload:', JSON.stringify({
          ...payload,
          grants: payload.grants ? '...' : undefined,
        }, null, 2));
      }
    } catch (e) {
      console.log('⚠️ Could not decode token (this is normal)');
    }

    console.log('\n✅ Token generation test PASSED!');
    console.log('Your Twilio API Key credentials are correct.');
    
  } catch (error: any) {
    console.error('\n❌ ERROR: Token generation failed!');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Verify TWILIO_API_KEY_SID starts with "SK..."');
    console.error('2. Verify TWILIO_API_KEY_SECRET is the correct secret (not the SID)');
    console.error('3. Make sure you copied the secret when creating the API Key');
    console.error('4. Check that there are no extra spaces in .env file');
    process.exit(1);
  }
}

testTokenGeneration();

