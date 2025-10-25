// Manual payment creation script
// Run with: node create-payment.js

const fetch = require('node-fetch');

async function createPayment() {
  try {
    // Replace these with your actual values
    const bookingId = '68fd01738cdb61857469840b';
    const sessionId = 'cs_test_a1gVLdgAJpdE6DIyQRVYaaE4PTMxiTBHLcU3KFUnPG8isUURvFAKHVnSKY';
    
    // You'll need to get these from your browser's developer tools
    const clerkToken = 'YOUR_CLERK_TOKEN_HERE'; // Get from browser dev tools
    const userId = 'YOUR_USER_ID_HERE'; // Get from browser dev tools
    
    const response = await fetch('http://localhost:3001/api/stripe/create-manual-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clerkToken}`,
        'X-User-ID': userId,
        'X-User-Type': 'client',
      },
      body: JSON.stringify({
        bookingId,
        sessionId,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Payment record created successfully!');
      console.log('Payment ID:', result.data._id);
      console.log('Booking status updated to: paid');
    } else {
      console.error('❌ Failed to create payment:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createPayment();
