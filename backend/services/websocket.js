const winston = require('winston');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/websocket.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Store connected clients
const clients = new Map();

// Notification queues for different types
const notificationQueues = {
  anomalies: [],
  alerts: [],
  system: []
};

function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const clientId = generateClientId();
    const clientInfo = {
      id: clientId,
      ip: req.socket.remoteAddress,
      connectedAt: new Date(),
      subscriptions: new Set()
    };

    clients.set(clientId, { ws, info: clientInfo });

    logger.info(`WebSocket client connected: ${clientId}`);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection_established',
      clientId,
      timestamp: new Date(),
      message: 'Connected to GAIA Anomaly Detection System'
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'subscribe':
            handleSubscription(clientId, data.channels);
            break;
          case 'unsubscribe':
            handleUnsubscription(clientId, data.channels);
            break;
          case 'ping':
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date()
            }));
            break;
          default:
            logger.warn(`Unknown message type from client ${clientId}:`, data.type);
        }
      } catch (error) {
        logger.error(`Error processing message from client ${clientId}:`, error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: new Date()
        }));
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      logger.info(`WebSocket client disconnected: ${clientId}`);
      clients.delete(clientId);

      // Clean up subscriptions
      Object.keys(notificationQueues).forEach(queueType => {
        notificationQueues[queueType] = notificationQueues[queueType]
          .filter(notification => notification.targetClients !== clientId);
      });
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error(`WebSocket error for client ${clientId}:`, error);
    });
  });

  // Periodic cleanup and health checks
  setInterval(() => {
    cleanupDisconnectedClients();
  }, 30000); // Every 30 seconds
}

function handleSubscription(clientId, channels) {
  const client = clients.get(clientId);
  if (!client) return;

  if (Array.isArray(channels)) {
    channels.forEach(channel => {
      client.info.subscriptions.add(channel);
    });
  } else if (typeof channels === 'string') {
    client.info.subscriptions.add(channels);
  }

  client.ws.send(JSON.stringify({
    type: 'subscription_confirmed',
    channels: Array.from(client.info.subscriptions),
    timestamp: new Date()
  }));

  logger.info(`Client ${clientId} subscribed to channels:`, channels);
}

function handleUnsubscription(clientId, channels) {
  const client = clients.get(clientId);
  if (!client) return;

  if (Array.isArray(channels)) {
    channels.forEach(channel => {
      client.info.subscriptions.delete(channel);
    });
  } else if (typeof channels === 'string') {
    client.info.subscriptions.delete(channels);
  }

  client.ws.send(JSON.stringify({
    type: 'unsubscription_confirmed',
    channels: Array.from(client.info.subscriptions),
    timestamp: new Date()
  }));

  logger.info(`Client ${clientId} unsubscribed from channels:`, channels);
}

function broadcastToChannel(channel, message, excludeClientId = null) {
  let sentCount = 0;

  for (const [clientId, client] of clients) {
    if (excludeClientId && clientId === excludeClientId) continue;

    if (client.info.subscriptions.has(channel) || client.info.subscriptions.has('all')) {
      try {
        if (client.ws.readyState === client.ws.OPEN) {
          client.ws.send(JSON.stringify({
            ...message,
            channel,
            timestamp: new Date()
          }));
          sentCount++;
        }
      } catch (error) {
        logger.error(`Failed to send message to client ${clientId}:`, error);
      }
    }
  }

  logger.debug(`Broadcasted message to ${sentCount} clients on channel ${channel}`);
}

function sendToClient(clientId, message) {
  const client = clients.get(clientId);
  if (!client) {
    logger.warn(`Attempted to send message to non-existent client: ${clientId}`);
    return false;
  }

  try {
    if (client.ws.readyState === client.ws.OPEN) {
      client.ws.send(JSON.stringify({
        ...message,
        timestamp: new Date()
      }));
      return true;
    }
  } catch (error) {
    logger.error(`Failed to send message to client ${clientId}:`, error);
  }

  return false;
}

// Notification functions for different types of events
function notifyNewAnomaly(anomaly) {
  const message = {
    type: 'new_anomaly',
    data: {
      id: anomaly.id,
      title: anomaly.title,
      severity: anomaly.severity,
      confidence: anomaly.confidence,
      location: anomaly.location,
      timestamp: anomaly.timestamp
    }
  };

  broadcastToChannel('anomalies', message);
  addToNotificationQueue('anomalies', message);
}

function notifyAnomalyUpdate(anomalyId, updates) {
  const message = {
    type: 'anomaly_update',
    data: {
      anomalyId,
      updates,
      timestamp: new Date()
    }
  };

  broadcastToChannel('anomalies', message);
}

function notifyHighSeverityAlert(anomaly) {
  const message = {
    type: 'high_severity_alert',
    data: {
      id: anomaly.id,
      title: anomaly.title,
      severity: anomaly.severity,
      description: anomaly.description,
      location: anomaly.location,
      recommendedActions: ['immediate_review', 'escalate_to_command']
    },
    priority: 'high'
  };

  broadcastToChannel('alerts', message);
  broadcastToChannel('anomalies', message);
  addToNotificationQueue('alerts', message);
}

function notifySystemStatus(status) {
  const message = {
    type: 'system_status',
    data: status
  };

  broadcastToChannel('system', message);
}

function notifyWorkflowUpdate(workflowId, status) {
  const message = {
    type: 'workflow_update',
    data: {
      workflowId,
      status,
      timestamp: new Date()
    }
  };

  broadcastToChannel('workflows', message);
}

function addToNotificationQueue(queueType, notification) {
  if (notificationQueues[queueType]) {
    notificationQueues[queueType].push({
      ...notification,
      queuedAt: new Date(),
      id: generateNotificationId()
    });

    // Keep only last 100 notifications per queue
    if (notificationQueues[queueType].length > 100) {
      notificationQueues[queueType] = notificationQueues[queueType].slice(-100);
    }
  }
}

function getNotificationHistory(queueType, limit = 50) {
  if (notificationQueues[queueType]) {
    return notificationQueues[queueType].slice(-limit);
  }
  return [];
}

function cleanupDisconnectedClients() {
  for (const [clientId, client] of clients) {
    if (client.ws.readyState !== client.ws.OPEN) {
      logger.info(`Removing disconnected client: ${clientId}`);
      clients.delete(clientId);
    }
  }
}

function getConnectedClientsCount() {
  return clients.size;
}

function getClientStats() {
  const stats = {
    total: clients.size,
    subscriptions: {}
  };

  for (const [clientId, client] of clients) {
    for (const subscription of client.info.subscriptions) {
      stats.subscriptions[subscription] = (stats.subscriptions[subscription] || 0) + 1;
    }
  }

  return stats;
}

function generateClientId() {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateNotificationId() {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  setupWebSocket,
  broadcastToChannel,
  sendToClient,
  notifyNewAnomaly,
  notifyAnomalyUpdate,
  notifyHighSeverityAlert,
  notifySystemStatus,
  notifyWorkflowUpdate,
  getNotificationHistory,
  getConnectedClientsCount,
  getClientStats
};