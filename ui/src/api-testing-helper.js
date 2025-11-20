// API Testing Helper - Run this in Browser Console (F12 → Console tab)
// Usage: Copy and paste any of these functions into browser console to test APIs

const API_URL = 'http://localhost:8000';

// Test Status Endpoint
async function testStatus() {
  try {
    const response = await fetch(`${API_URL}/status`);
    const data = await response.json();
    console.log('✓ Status:', data);
    return data;
  } catch (err) {
    console.error('✗ Status failed:', err);
  }
}

// Test Move Command
async function testMove(speed = 0.5) {
  try {
    const response = await fetch(`${API_URL}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed }),
    });
    const data = await response.json();
    console.log(`✓ Move (${speed}):`, data);
    return data;
  } catch (err) {
    console.error(`✗ Move (${speed}) failed:`, err);
  }
}

// Test Turn Command
async function testTurn(speed = 0.5, direction = 'left') {
  try {
    const response = await fetch(`${API_URL}/turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed, direction }),
    });
    const data = await response.json();
    console.log(`✓ Turn (${speed}, ${direction}):`, data);
    return data;
  } catch (err) {
    console.error(`✗ Turn (${speed}, ${direction}) failed:`, err);
  }
}

// Test Stop Command
async function testStop() {
  try {
    const response = await fetch(`${API_URL}/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    console.log('✓ Stop:', data);
    return data;
  } catch (err) {
    console.error('✗ Stop failed:', err);
  }
}

// Test Emergency Stop Command
async function testEmergencyStop() {
  try {
    const response = await fetch(`${API_URL}/emergency_stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    console.log('✓ Emergency Stop:', data);
    return data;
  } catch (err) {
    console.error('✗ Emergency Stop failed:', err);
  }
}

// Test Lift Command
async function testLift(height = 50, command = 'set') {
  try {
    const response = await fetch(`${API_URL}/lift`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ height_cm: height, command }),
    });
    const data = await response.json();
    console.log(`✓ Lift (${height}cm, ${command}):`, data);
    return data;
  } catch (err) {
    console.error(`✗ Lift (${height}cm, ${command}) failed:`, err);
  }
}

// Run all tests
async function testAllAPIs() {
  console.log('=== Testing All APIs ===');
  
  console.log('\n1. Testing Status...');
  await testStatus();
  
  console.log('\n2. Testing Move (forward)...');
  await testMove(0.5);
  
  console.log('\n3. Testing Turn (left)...');
  await testTurn(0.3, 'left');
  
  console.log('\n4. Testing Stop...');
  await testStop();
  
  console.log('\n5. Testing Move (backward)...');
  await testMove(-0.5);
  
  console.log('\n6. Testing Turn (right)...');
  await testTurn(0.3, 'right');
  
  console.log('\n7. Testing Emergency Stop...');
  await testEmergencyStop();
  
  console.log('\n8. Testing Lift...');
  await testLift(100, 'set');
  
  console.log('\n=== All Tests Complete ===');
}

// Quick reference
console.log(`
╔════════════════════════════════════════════════════════════╗
║         API Testing Helper - Quick Reference              ║
╚════════════════════════════════════════════════════════════╝

Test Individual APIs:
  testStatus()                    // Get current robot state
  testMove(0.5)                   // Move with speed 0-1
  testTurn(0.3, 'left')           // Turn (left or right)
  testStop()                      // Stop robot
  testEmergencyStop()             // Emergency stop
  testLift(100, 'set')            // Lift control

Run All Tests:
  testAllAPIs()                   // Run complete test suite

Expected Results:
  ✓ All functions should log success messages
  ✗ Any failures indicate API issues
  
Check the console output for details!
`);
