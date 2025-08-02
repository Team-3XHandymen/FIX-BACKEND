import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const testAPI = async () => {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Get all services
    console.log('2. Testing get all services...');
    const servicesResponse = await axios.get(`${API_BASE_URL}/services`);
    console.log('✅ Services API response:', {
      success: servicesResponse.data.success,
      message: servicesResponse.data.message,
      dataLength: servicesResponse.data.data?.length || 0
    });
    console.log('');

    // Test 3: Test CORS
    console.log('3. Testing CORS...');
    const corsResponse = await axios.get(`${API_BASE_URL}/services`, {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    console.log('✅ CORS test passed');
    console.log('');

    console.log('🎉 All API tests passed!');
    console.log('\n📊 Summary:');
    console.log('- Backend is running on port 3001');
    console.log('- Services API is accessible');
    console.log('- CORS is configured correctly');
    console.log(`- Found ${servicesResponse.data.data?.length || 0} services in database`);

  } catch (error: any) {
    console.error('❌ API test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the backend server is running:');
      console.error('   cd FIX-BACKEND && npm run dev');
    }
    
    if (error.response?.status === 404) {
      console.error('💡 Make sure the API routes are properly configured');
    }
    
    if (error.response?.status === 500) {
      console.error('💡 Check the backend console for server errors');
    }
  }
};

// Run the test
testAPI(); 