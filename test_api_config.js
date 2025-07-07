// Test API configuration
const { getApiBaseUrl } = require('./apps/web-frontend/src/lib/api-config.ts');

console.log('Testing API configuration...');

// Mock window object for testing
global.window = {
  location: {
    hostname: 'localhost',
    protocol: 'http:'
  }
};

try {
  const apiUrl = getApiBaseUrl();
  console.log('✅ API URL:', apiUrl);
  
  // Test fetch
  fetch(apiUrl + '/health')
    .then(response => {
      console.log('✅ Backend Health Check:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('✅ Backend Response:', data);
    })
    .catch(error => {
      console.log('❌ Backend Error:', error.message);
    });
} catch (error) {
  console.log('❌ API Config Error:', error.message);
}
