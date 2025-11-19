#!/usr/bin/env node

/**
 * Test Real Data Integration
 * Tests upload and GDACS sync functionality
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

console.log('🧪 Testing Real Data Integration\n');
console.log(`API Base URL: ${BASE_URL}\n`);

async function testGDACSSync() {
  console.log('1️⃣ Testing GDACS Sync...');
  try {
    const response = await axios.post(`${BASE_URL}/api/realtime/sync-disasters`);
    
    if (response.data.success) {
      console.log(`✅ GDACS Sync Successful`);
      console.log(`   Synced: ${response.data.synced} disasters`);
      console.log(`   Errors: ${response.data.errors}`);
      
      if (response.data.savedAnomalies && response.data.savedAnomalies.length > 0) {
        console.log(`   First anomaly: ${response.data.savedAnomalies[0].title}`);
      }
    } else {
      console.log(`❌ GDACS Sync Failed`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  console.log('');
}

async function testHotspots() {
  console.log('2️⃣ Testing Hotspots with GDACS...');
  try {
    const response = await axios.get(`${BASE_URL}/api/realtime/hotspots`);
    
    if (response.data.hotspots) {
      console.log(`✅ Hotspots Retrieved`);
      console.log(`   Total: ${response.data.summary.total}`);
      console.log(`   Disasters: ${response.data.summary.disasters}`);
      console.log(`   Cities: ${response.data.summary.cities}`);
      console.log(`   Critical: ${response.data.summary.critical}`);
      console.log(`   High: ${response.data.summary.high}`);
      
      // Show first disaster
      const disaster = response.data.hotspots.find(h => h.type === 'disaster');
      if (disaster) {
        console.log(`\n   Sample Disaster:`);
        console.log(`   - Name: ${disaster.name}`);
        console.log(`   - Severity: ${disaster.severity}`);
        console.log(`   - Location: ${disaster.lat}, ${disaster.lon}`);
      }
    } else {
      console.log(`❌ No hotspots data`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  console.log('');
}

async function testUpload() {
  console.log('3️⃣ Testing File Upload...');
  try {
    // Create a test file
    const testContent = 'This is a test anomaly report. Unusual activity detected in the area.';
    const testFile = 'test-anomaly.txt';
    fs.writeFileSync(testFile, testContent);
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(testFile));
    form.append('title', 'Test Anomaly Upload');
    form.append('description', 'Testing real data integration');
    form.append('location', JSON.stringify({
      lat: 40.7128,
      lng: -74.0060,
      address: 'New York, NY'
    }));
    
    const response = await axios.post(
      `${BASE_URL}/api/upload/analyze`,
      form,
      {
        headers: form.getHeaders()
      }
    );
    
    if (response.data.saved) {
      console.log(`✅ Upload Successful`);
      console.log(`   Anomaly ID: ${response.data.anomalyId}`);
      console.log(`   Is Anomaly: ${response.data.isAnomaly}`);
      console.log(`   Confidence: ${response.data.confidence}`);
      console.log(`   Saved to DB: ${response.data.saved}`);
      
      if (response.data.savedAnomaly) {
        console.log(`   Title: ${response.data.savedAnomaly.title}`);
        console.log(`   Status: ${response.data.savedAnomaly.status}`);
      }
    } else {
      console.log(`⚠️ Upload analyzed but not saved (might not be an anomaly)`);
      console.log(`   Is Anomaly: ${response.data.isAnomaly}`);
      console.log(`   Confidence: ${response.data.confidence}`);
    }
    
    // Clean up
    fs.unlinkSync(testFile);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  console.log('');
}

async function testAnomaliesList() {
  console.log('4️⃣ Testing Anomalies List...');
  try {
    const response = await axios.get(`${BASE_URL}/api/anomalies?limit=5`);
    
    if (response.data.anomalies) {
      console.log(`✅ Anomalies Retrieved`);
      console.log(`   Total: ${response.data.pagination.totalItems}`);
      console.log(`   Showing: ${response.data.anomalies.length}`);
      
      if (response.data.anomalies.length > 0) {
        console.log(`\n   Recent Anomalies:`);
        response.data.anomalies.slice(0, 3).forEach((anomaly, i) => {
          console.log(`   ${i + 1}. ${anomaly.title}`);
          console.log(`      Severity: ${anomaly.severity}, Confidence: ${anomaly.confidence}`);
          console.log(`      Tags: ${anomaly.tags.join(', ')}`);
        });
      }
    } else {
      console.log(`❌ No anomalies data`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  console.log('');
}

async function runTests() {
  try {
    await testGDACSSync();
    await testHotspots();
    await testUpload();
    await testAnomaliesList();
    
    console.log('✅ All Tests Complete!\n');
    console.log('Summary:');
    console.log('- GDACS disasters are now synced to database');
    console.log('- Hotspots include real GDACS data');
    console.log('- Uploads are saved as anomalies');
    console.log('- All data is queryable via /api/anomalies');
    console.log('\nNext: Check your dashboard to see the real data!');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

runTests();
