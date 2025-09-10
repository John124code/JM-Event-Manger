// Test backend connection
async function testBackend() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('Backend test result:', data);
    return data;
  } catch (error) {
    console.error('Backend test failed:', error);
    return null;
  }
}

// Test the connection
testBackend().then(result => {
  if (result) {
    console.log('✅ Backend is connected and working!');
  } else {
    console.log('❌ Backend connection failed');
  }
});
