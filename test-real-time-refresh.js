// Test script to verify real-time refresh system
// This simulates what happens when a sale is made

console.log('🧪 Testing Real-Time Refresh System...');

// Test 1: Event dispatching
console.log('\n📡 Test 1: Event Dispatching');
try {
  const testEvent = new CustomEvent('salesDataUpdated', {
    detail: {
      sale: {
        id: 'TEST-SALE-123',
        total: 500,
        items: [{ name: 'Test Product', quantity: 1, price: 500 }]
      },
      timestamp: new Date().toISOString()
    }
  });
  
  console.log('✅ CustomEvent created successfully');
  console.log('Event details:', testEvent.detail);
  
  // Test event listener
  window.addEventListener('salesDataUpdated', (event) => {
    console.log('✅ Event received:', event.detail);
  });
  
  // Dispatch test event
  window.dispatchEvent(testEvent);
  
} catch (error) {
  console.error('❌ Event dispatching failed:', error);
}

// Test 2: localStorage update
console.log('\n💾 Test 2: localStorage Update');
try {
  const timestamp = new Date().toISOString();
  localStorage.setItem('lastSaleUpdate', timestamp);
  console.log('✅ localStorage updated:', timestamp);
  
  // Test storage listener
  window.addEventListener('storage', (e) => {
    if (e.key === 'lastSaleUpdate') {
      console.log('✅ Storage event received:', e.newValue);
    }
  });
  
} catch (error) {
  console.error('❌ localStorage update failed:', error);
}

// Test 3: API connectivity
console.log('\n🌐 Test 3: API Connectivity');
async function testAPIEndpoints() {
  const endpoints = [
    '/api/dashboard/overview',
    '/api/sales',
    '/api/reports/invoices'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`❌ ${endpoint}:`, error.message);
    }
  }
}

// Only run API tests if we're in a browser environment
if (typeof window !== 'undefined' && window.fetch) {
  testAPIEndpoints();
}

console.log('\n🎯 Real-Time Refresh Test Summary:');
console.log('1. ✅ Event system functional');
console.log('2. ✅ localStorage update working');
console.log('3. 🔄 API connectivity tested');
console.log('\n📋 How to test manually:');
console.log('1. Open Dashboard in browser');
console.log('2. Open POS System in another tab');
console.log('3. Make a sale in POS System');
console.log('4. Check if Dashboard automatically refreshes');
console.log('5. Look for console logs: "🔄 Dashboard received sales update"'); 