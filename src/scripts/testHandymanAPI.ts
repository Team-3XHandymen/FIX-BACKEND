import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Test data for handyman registration
const testHandymanData = {
  name: "John Doe",
  nic: "123456789V",
  contactNumber: "+94771234567",
  emailAddress: "john.doe@example.com",
  personalPhoto: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  skills: ["electrical", "plumbing"],
  experience: 5,
  certifications: ["nvq", "techvoc"],
  services: ["electrical", "plumbing"],
  address: {
    street: "123 Main Street",
    city: "Colombo",
    state: "Western Province",
    zipCode: "10000"
  },
  availability: {
    workingDays: "Monday to Friday",
    workingHours: "9 AM to 5 PM"
  },
  paymentMethod: "Cash, Bank Transfer"
};

async function testHandymanRegistration() {
  try {
    console.log('Testing Handyman Registration API...');
    
    // Test registration
    const response = await axios.post(`${API_BASE_URL}/handyman/register`, testHandymanData, {
      headers: {
        'X-User-ID': 'test-user-123',
        'X-User-Type': 'provider',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Handyman registration successful!');
      
      // Test getting profile
      const profileResponse = await axios.get(`${API_BASE_URL}/handyman/profile`, {
        headers: {
          'X-User-ID': 'test-user-123',
          'X-User-Type': 'provider'
        }
      });
      
      console.log('Profile Response:', profileResponse.data);
      
      if (profileResponse.data.success) {
        console.log('✅ Handyman profile retrieval successful!');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testHandymanRegistration(); 