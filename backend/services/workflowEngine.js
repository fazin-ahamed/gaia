const { models } = require('../models');
const { analyzeAnomalyData, crossVerifyData } = require('./geminiAI');
const { notifyAnomalyUpdate, notifyWorkflowUpdate } = require('./websocket');
const winston = require('winston');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/workflow-engine.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Workflow execution context
const executionContexts = new Map();

async function initializeWorkflowEngine() {
  logger.info('Initializing Opus Workflow Engine');

  // Load and validate existing workflows
  try {
    const workflows = await models.Workflow.findAll({
      where: { status: 'active' }
    });

    logger.info(`Loaded ${workflows.length} active workflows`);

    // Create default workflow if none exist
    if (workflows.length === 0) {
      await createDefaultWorkflow();
    }

  } catch (error) {
    logger.error('Error initializing workflow engine:', error);
  }
}

async function createDefaultWorkflow() {
  try {
    const defaultWorkflow = await models.Workflow.create({
      name: 'Default Anomaly Processing Workflow',
      description: 'Standard intake-decide-review-deliver workflow',
      template: {
        version: '1.0',
        type: 'anomaly_processing'
      },
      nodes: [
        {
          id: 'intake',
          type: 'intake',
          label: 'Data Intake & Initial Processing',
          config: {
            autoProcess: true,
            validateData: true
          }
        },
        {
          id: 'ai_analysis',
          type: 'ai',
          label: 'AI Analysis & Anomaly Detection',
          config: {
            model: 'gemini-pro-vision',
            confidenceThreshold: 0.7,
            multimodalAnalysis: true
          }
        },
        {
          id: 'cross_verification',
          type: 'verification',
          label: 'Cross-Modal Verification',
          config: {
            requiredSources: 2,
            verificationTimeout: 300000 // 5 minutes
          }
        },
        {
          id: 'decision',
          type: 'decision',
          label: 'Decision Point',
          config: {
            autoApproveThreshold: 0.8,
            humanReviewThreshold: 0.6,
            escalateThreshold: 0.9
          }
        },
        {
          id: 'human_review',
          type: 'human',
          label: 'Human Review',
          config: {
            timeout: 3600000, // 1 hour
            requiredApprovals: 1
          }
        },
        {
          id: 'escalation',
          type: 'escalation',
          label: 'Escalation to Higher Authority',
          config: {
            notificationChannels: ['email', 'dashboard', 'alert_system']
          }
        },
        {
          id: 'approval',
          type: 'approval',
          label: 'Final Approval',
          config: {
            generateReport: true,
            updateAuditLog: true
          }
        },
        {
          id: 'delivery',
          type: 'delivery',
          label: 'Deliver Results & Notifications',
          config: {
            notificationTargets: ['stakeholders', 'systems'],
            archiveData: true
          }
        }
      ],
      edges: [
        { source: 'intake', target: 'ai_analysis' },
        { source: 'ai_analysis', target: 'cross_verification' },
        { source: 'cross_verification', target: 'decision' },
        { source: 'decision', target: 'human_review', condition: 'needs_review' },
        { source: 'decision', target: 'escalation', condition: 'escalate' },
        { source: 'decision', target: 'approval', condition: 'auto_approve' },
        { source: 'human_review', target: 'approval', condition: 'approved' },
        { source: 'human_review', target: 'escalation', condition: 'escalate' },
        { source: 'escalation', target: 'approval' },
        { source: 'approval', target: 'delivery' }
      ],
      variables: {
        autoModeEnabled: process.env.AUTONOMOUS_MODE === 'true',
        confidenceThreshold: 0.7,
        escalationEnabled: true
      },
      status: 'active',
      tags: ['default', 'standard']
    });

    logger.info(`Created default workflow: ${defaultWorkflow.id}`);
    return defaultWorkflow;

  } catch (error) {
    logger.error('Error creating default workflow:', error);
    throw error;
  }
}

async function executeWorkflow(workflowId, anomalyId, parameters = {}) {
  try {
    const workflow = await models.Workflow.findByPk(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const anomaly = await models.Anomaly.findByPk(anomalyId);
    if (!anomaly) {
      throw new Error(`Anomaly ${anomalyId} not found`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create execution context
    const context = {
      executionId,
      workflowId,
      anomalyId,
      anomaly,
      workflow,
      parameters,
      currentNode: null,
      nodeStates: new Map(),
      variables: { ...workflow.variables, ...parameters },
      startedAt: new Date(),
      status: 'running'
    };

    executionContexts.set(executionId, context);

    // Assign workflow to anomaly
    await anomaly.update({ workflowId });

    // Start execution from intake node
    await executeNode(executionId, 'intake');

    logger.info(`Started workflow execution ${executionId} for anomaly ${anomalyId}`);
    notifyWorkflowUpdate(workflowId, { status: 'running', executionId });

    return { executionId, status: 'running' };

  } catch (error) {
    logger.error(`Error executing workflow ${workflowId} for anomaly ${anomalyId}:`, error);
    throw error;
  }
}

async function executeNode(executionId, nodeId) {
  const context = executionContexts.get(executionId);
  if (!context) {
    throw new Error(`Execution context ${executionId} not found`);
  }

  const node = context.workflow.nodes.find(n => n.id === nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found in workflow ${context.workflowId}`);
  }

  context.currentNode = nodeId;

  logger.info(`Executing node ${nodeId} (${node.type}) in execution ${executionId}`);

  try {
    switch (node.type) {
      case 'intake':
        await executeIntakeNode(context, node);
        break;
      case 'ai':
        await executeAINode(context, node);
        break;
      case 'verification':
        await executeVerificationNode(context, node);
        break;
      case 'decision':
        await executeDecisionNode(context, node);
        break;
      case 'human':
        await executeHumanNode(context, node);
        break;
      case 'escalation':
        await executeEscalationNode(context, node);
        break;
      case 'approval':
        await executeApprovalNode(context, node);
        break;
      case 'delivery':
        await executeDeliveryNode(context, node);
        break;
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }

    // Mark node as completed
    context.nodeStates.set(nodeId, { status: 'completed', completedAt: new Date() });

    // Find next node(s) to execute
    await proceedToNextNodes(context, nodeId);

  } catch (error) {
    logger.error(`Error executing node ${nodeId}:`, error);
    context.nodeStates.set(nodeId, { status: 'failed', error: error.message, failedAt: new Date() });

    // Handle node failure
    await handleNodeFailure(context, nodeId, error);
  }
}

async function executeIntakeNode(context, node) {
  // Intake node: Validate and prepare anomaly data
  const anomaly = context.anomaly;

  // Validate data completeness
  const validation = {
    hasBasicInfo: !!(anomaly.title && anomaly.description),
    hasLocation: !!anomaly.location,
    hasModalities: !!anomaly.modalities,
    hasSourceAPIs: !!(anomaly.sourceApis && anomaly.sourceApis.length > 0)
  };

  context.variables.intakeValidation = validation;
  context.variables.dataCompleteness = Object.values(validation).filter(Boolean).length / Object.keys(validation).length;

  logger.info(`Intake validation completed for anomaly ${context.anomalyId}`, validation);
}

async function executeAINode(context, node) {
  // AI Analysis node: Use Gemini AI for anomaly analysis
  const anomaly = context.anomaly;

  const analysis = await analyzeAnomalyData({
    modalities: anomaly.modalities,
    location: anomaly.location,
    timestamp: anomaly.timestamp,
    sourceApis: anomaly.sourceApis
  });

  // Update anomaly with AI analysis
  await anomaly.update({
    aiAnalysis: analysis,
    confidence: analysis.confidence,
    severity: analysis.severity,
    lastUpdated: new Date()
  });

  context.variables.aiAnalysis = analysis;
  context.variables.confidence = analysis.confidence;

  // Create audit log
  await models.AuditLog.create({
    anomalyId: context.anomalyId,
    action: 'processed',
    actor: 'ai',
    reasoning: 'AI analysis completed via workflow',
    confidence: analysis.confidence,
    changes: { aiAnalysis: true },
    currentState: anomaly.toJSON()
  });

  notifyAnomalyUpdate(context.anomalyId, { aiAnalysis: analysis });

  logger.info(`AI analysis completed for anomaly ${context.anomalyId} with confidence ${analysis.confidence}`);
}

async function executeVerificationNode(context, node) {
  // Cross-verification node: Verify anomaly across multiple sources
  const anomaly = context.anomaly;

  // Get related API data
  const apiData = await models.ApiData.findAll({
    where: { anomalyId: context.anomalyId }
  });

  if (apiData.length >= node.config.requiredSources) {
    const verification = await crossVerifyData(apiData.map(d => d.processedData));

    context.variables.crossVerification = verification;
    context.variables.verificationConfidence = verification.combinedConfidence;

    // Update anomaly
    await anomaly.update({
      crossVerification: verification,
      lastUpdated: new Date()
    });

    notifyAnomalyUpdate(context.anomalyId, { crossVerification: verification });
  } else {
    context.variables.crossVerification = { status: 'insufficient_data' };
    context.variables.verificationConfidence = 0.5;
  }

  logger.info(`Cross-verification completed for anomaly ${context.anomalyId}`);
}

async function executeDecisionNode(context, node) {
  // Decision node: Determine next steps based on confidence and thresholds
  const confidence = context.variables.confidence || 0;
  const config = node.config;

  let decision = 'needs_review'; // default

  if (confidence >= config.autoApproveThreshold) {
    decision = 'auto_approve';
  } else if (confidence >= config.escalateThreshold) {
    decision = 'escalate';
  } else if (confidence < config.humanReviewThreshold) {
    decision = 'needs_review';
  }

  context.variables.decision = decision;
  context.variables.decisionReason = `Confidence ${confidence} led to ${decision}`;

  logger.info(`Decision made for anomaly ${context.anomalyId}: ${decision} (confidence: ${confidence})`);
}

async function executeHumanNode(context, node) {
  // Human review node: Wait for human input
  const anomaly = await models.Anomaly.findByPk(context.anomalyId);

  // Update anomaly status to require human review
  await anomaly.update({
    status: 'processing',
    lastUpdated: new Date()
  });

  // In a real implementation, this would send notifications and wait for human input
  // For now, we'll simulate a timeout-based auto-progression
  setTimeout(async () => {
    await executeNode(context.executionId, 'approval');
  }, node.config.timeout / 10); // Faster for demo

  logger.info(`Human review initiated for anomaly ${context.anomalyId}`);
}

async function executeEscalationNode(context, node) {
  // Escalation node: Notify higher authorities
  const anomaly = context.anomaly;

  await anomaly.update({
    severity: 'critical',
    status: 'escalated',
    lastUpdated: new Date()
  });

  // Create audit log
  await models.AuditLog.create({
    anomalyId: context.anomalyId,
    action: 'escalated',
    actor: 'system',
    reasoning: 'Workflow escalation due to high severity',
    changes: { severity: 'critical', status: 'escalated' },
    currentState: anomaly.toJSON()
  });

  notifyAnomalyUpdate(context.anomalyId, { severity: 'critical', status: 'escalated' });

  logger.info(`Anomaly ${context.anomalyId} escalated to critical priority`);
}

async function executeApprovalNode(context, node) {
  // Approval node: Final approval and report generation
  const anomaly = context.anomaly;

  await anomaly.update({
    status: 'approved',
    lastUpdated: new Date()
  });

  // Generate report if configured
  if (node.config.generateReport) {
    // TODO: Generate comprehensive report
    context.variables.reportGenerated = true;
  }

  // Create audit log
  await models.AuditLog.create({
    anomalyId: context.anomalyId,
    action: 'approved',
    actor: 'system',
    reasoning: 'Workflow approval completed',
    changes: { status: 'approved' },
    currentState: anomaly.toJSON()
  });

  notifyAnomalyUpdate(context.anomalyId, { status: 'approved' });

  logger.info(`Anomaly ${context.anomalyId} approved and finalized`);
}

async function executeDeliveryNode(context, node) {
  // Delivery node: Send notifications and archive
  const anomaly = context.anomaly;

  // Mark workflow as completed
  context.status = 'completed';
  context.completedAt = new Date();

  await anomaly.update({
    status: 'processed',
    lastUpdated: new Date()
  });

  // Update workflow execution count
  await context.workflow.update({
    lastExecuted: new Date(),
    executionCount: context.workflow.executionCount + 1,
    averageExecutionTime: calculateAverageExecutionTime(context.workflow, context.startedAt, context.completedAt)
  });

  notifyWorkflowUpdate(context.workflowId, { status: 'completed', executionId: context.executionId });

  logger.info(`Workflow execution ${context.executionId} completed for anomaly ${context.anomalyId}`);
}

async function proceedToNextNodes(context, currentNodeId) {
  const edges = context.workflow.edges.filter(edge => edge.source === currentNodeId);

  for (const edge of edges) {
    let shouldProceed = true;

    // Check condition if present
    if (edge.condition) {
      shouldProceed = evaluateCondition(context, edge.condition);
    }

    if (shouldProceed) {
      await executeNode(context.executionId, edge.target);
    }
  }
}

function evaluateCondition(context, condition) {
  const variables = context.variables;

  switch (condition) {
    case 'needs_review':
      return variables.decision === 'needs_review';
    case 'escalate':
      return variables.decision === 'escalate';
    case 'auto_approve':
      return variables.decision === 'auto_approve';
    case 'approved':
      return variables.humanDecision === 'approved';
    default:
      return true;
  }
}

async function handleNodeFailure(context, nodeId, error) {
  logger.error(`Node ${nodeId} failed in execution ${context.executionId}:`, error);

  // Mark execution as failed
  context.status = 'failed';
  context.error = error.message;

  // Update anomaly status
  await context.anomaly.update({
    status: 'failed',
    lastUpdated: new Date()
  });

  // Notify about failure
  notifyWorkflowUpdate(context.workflowId, {
    status: 'failed',
    executionId: context.executionId,
    error: error.message
  });
}

function calculateAverageExecutionTime(workflow, startTime, endTime) {
  const executionTime = endTime - startTime;
  const totalTime = (workflow.averageExecutionTime || 0) * (workflow.executionCount || 1) + executionTime;
  return totalTime / ((workflow.executionCount || 0) + 1);
}

function getExecutionStatus(executionId) {
  const context = executionContexts.get(executionId);
  if (!context) return null;

  return {
    executionId,
    status: context.status,
    currentNode: context.currentNode,
    startedAt: context.startedAt,
    completedAt: context.completedAt,
    progress: context.nodeStates.size / context.workflow.nodes.length
  };
}

module.exports = {
  initializeWorkflowEngine,
  executeWorkflow,
  getExecutionStatus,
  createDefaultWorkflow
};