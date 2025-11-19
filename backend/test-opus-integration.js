#!/usr/bin/env node

/**
 * Opus Integration Test Script
 * Tests the remote workflow trigger functionality
 */

require('dotenv').config();
const {
  getWorkflowDetails,
  initiateJob,
  getJobStatus,
  triggerOpusWorkflow
} = require('./services/opusIntegration');

async function testOpusIntegration() {
  console.log('🧪 Testing Opus Remote Workflow Integration\n');

  // Check configuration
  console.log('1️⃣ Checking Configuration...');
  const serviceKey = process.env.OPUS_SERVICE_KEY;
  const workflowId = process.env.OPUS_WORKFLOW_ID;

  if (!serviceKey || !workflowId) {
    console.error('❌ Missing OPUS_SERVICE_KEY or OPUS_WORKFLOW_ID in .env');
    process.exit(1);
  }

  console.log(`✅ Service Key: ***${serviceKey.slice(-8)}`);
  console.log(`✅ Workflow ID: ${workflowId}\n`);

  // Test 1: Get Workflow Details
  console.log('2️⃣ Testing: Get Workflow Details...');
  try {
    const workflowResult = await getWorkflowDetails(workflowId);
    
    if (workflowResult.success) {
      console.log(`✅ Workflow Name: ${workflowResult.workflow.name}`);
      console.log(`✅ Schema Fields: ${Object.keys(workflowResult.jobPayloadSchema || {}).length}`);
      
      // Display schema
      if (workflowResult.jobPayloadSchema) {
        console.log('\n📋 Workflow Input Schema:');
        for (const [key, field] of Object.entries(workflowResult.jobPayloadSchema)) {
          console.log(`   - ${field.display_name || key}: ${field.type}`);
        }
      }
    } else {
      console.error(`❌ Failed: ${workflowResult.error}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  console.log('\n3️⃣ Testing: Initiate Job...');
  try {
    const jobResult = await initiateJob(
      workflowId,
      'Test Job - Opus Integration',
      'Testing remote workflow trigger from GAIA system'
    );

    if (jobResult.success) {
      console.log(`✅ Job Initiated: ${jobResult.jobExecutionId}`);
      
      // Test 3: Check Job Status
      console.log('\n4️⃣ Testing: Get Job Status...');
      const statusResult = await getJobStatus(jobResult.jobExecutionId);
      
      if (statusResult.success) {
        console.log(`✅ Job Status: ${statusResult.status}`);
      } else {
        console.error(`❌ Failed: ${statusResult.error}`);
      }
    } else {
      console.error(`❌ Failed: ${jobResult.error}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  // Test 4: Complete Workflow Trigger
  console.log('\n5️⃣ Testing: Complete Workflow Trigger...');
  try {
    const anomalyData = {
      id: 999,
      title: 'Test Anomaly - Integration Test',
      description: 'Testing complete workflow trigger with sample anomaly data',
      severity: 'medium',
      confidence: 0.85,
      location: { lat: 34.05, lng: -118.25 },
      timestamp: new Date().toISOString(),
      modalities: ['seismic', 'environmental'],
      metadata: {
        source: 'integration-test',
        testRun: true
      }
    };

    const triggerResult = await triggerOpusWorkflow(anomalyData);

    if (triggerResult && triggerResult.success) {
      console.log(`✅ Workflow Triggered Successfully`);
      console.log(`   Job Execution ID: ${triggerResult.jobExecutionId}`);
      console.log(`   Workflow ID: ${triggerResult.workflowId}`);
      console.log(`   Triggered At: ${triggerResult.triggeredAt}`);
    } else {
      console.error(`❌ Failed: ${triggerResult?.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  console.log('\n✅ Integration Test Complete!\n');
  console.log('📚 See OPUS_REMOTE_WORKFLOW_GUIDE.md for full documentation');
}

// Run tests
testOpusIntegration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
