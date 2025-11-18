import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import SeverityBadge from '../components/SeverityBadge';
import Button from '../components/Button';
import { Bell, Download, Mail, MessageSquare, CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
  anomalyId: string;
  swarmRecommendation: string;
  actions: string[];
  status: 'new' | 'acknowledged' | 'resolved';
}

const AlertsDeliveryPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert-001',
      title: 'Critical Seismic Anomaly Detected',
      description: 'Unusual seismic activity pattern detected in Pacific Northwest. Swarm consensus: 91%. Immediate attention required.',
      severity: 'Critical',
      timestamp: '2 minutes ago',
      anomalyId: 'anom-001',
      swarmRecommendation: 'Deploy additional monitoring equipment. Coordinate with geological survey agencies. Prepare evacuation protocols.',
      actions: ['Deploy Sensors', 'Alert Agencies', 'Prepare Response'],
      status: 'new'
    },
    {
      id: 'alert-002',
      title: 'Atmospheric Anomaly - High Confidence',
      description: 'Unexpected atmospheric pressure changes detected. Multi-modal verification confirms anomaly.',
      severity: 'High',
      timestamp: '15 minutes ago',
      anomalyId: 'anom-002',
      swarmRecommendation: 'Increase atmospheric monitoring. Alert aviation authorities. Monitor for weather pattern changes.',
      actions: ['Increase Monitoring', 'Alert Aviation', 'Weather Analysis'],
      status: 'acknowledged'
    },
    {
      id: 'alert-003',
      title: 'Unidentified Aerial Phenomena',
      description: 'Multiple radar contacts with unusual flight characteristics. Visual confirmation pending.',
      severity: 'High',
      timestamp: '1 hour ago',
      anomalyId: 'anom-003',
      swarmRecommendation: 'Scramble intercept aircraft. Enhance radar coverage. Coordinate with air defense.',
      actions: ['Intercept', 'Enhance Radar', 'Coordinate Defense'],
      status: 'acknowledged'
    },
    {
      id: 'alert-004',
      title: 'EM Interference Resolved',
      description: 'Electromagnetic interference spike in Tokyo Metropolitan area has been resolved.',
      severity: 'Medium',
      timestamp: '2 hours ago',
      anomalyId: 'anom-004',
      swarmRecommendation: 'Continue monitoring for recurrence. Document incident for pattern analysis.',
      actions: ['Monitor', 'Document'],
      status: 'resolved'
    }
  ]);

  const [filter, setFilter] = useState<string>('all');
  const [newAlertCount, setNewAlertCount] = useState(1);

  useEffect(() => {
    // Simulate real-time alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setNewAlertCount(prev => prev + 1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Bell className="w-4 h-4 text-red-400 animate-pulse" />;
      case 'acknowledged': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-red-400';
      case 'acknowledged': return 'text-yellow-400';
      case 'resolved': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gaia-dark p-6">
      <PageHeader 
        title="Alerts & Notifications" 
        subtitle="Real-time threat alerts with swarm-recommended actions"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-400 mb-1">{newAlertCount}</div>
          <div className="text-sm text-gray-400">New Alerts</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-1">
            {alerts.filter(a => a.status === 'acknowledged').length}
          </div>
          <div className="text-sm text-gray-400">Acknowledged</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">
            {alerts.filter(a => a.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-400">Resolved</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">{alerts.length}</div>
          <div className="text-sm text-gray-400">Total Today</div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                  filter === 'all' ? 'bg-blue-500 text-white' : 'bg-black/30 text-gray-400 hover:bg-black/50'
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                  filter === 'new' ? 'bg-red-500 text-white' : 'bg-black/30 text-gray-400 hover:bg-black/50'
                }`}
              >
                New ({alerts.filter(a => a.status === 'new').length})
              </button>
              <button
                onClick={() => setFilter('acknowledged')}
                className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                  filter === 'acknowledged' ? 'bg-yellow-500 text-white' : 'bg-black/30 text-gray-400 hover:bg-black/50'
                }`}
              >
                Acknowledged ({alerts.filter(a => a.status === 'acknowledged').length})
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                  filter === 'resolved' ? 'bg-green-500 text-white' : 'bg-black/30 text-gray-400 hover:bg-black/50'
                }`}
              >
                Resolved ({alerts.filter(a => a.status === 'resolved').length})
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              icon={Mail}
              onClick={() => {
                const email = prompt('Enter email address:');
                if (email) {
                  window.alert(`Alert report will be sent to ${email}`);
                }
              }}
            >
              Email Report
            </Button>
            <Button 
              variant="secondary" 
              icon={Download}
              onClick={() => {
                const allAlerts = JSON.stringify(filteredAlerts, null, 2);
                const blob = new Blob([allAlerts], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `all-alerts-${new Date().toISOString()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export All
            </Button>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className={alert.status === 'new' ? 'border-2 border-red-500/50' : ''}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(alert.status)}
                  <h3 className="text-xl font-semibold text-white">{alert.title}</h3>
                  <SeverityBadge severity={alert.severity} />
                  <span className={`text-xs font-semibold uppercase ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-gray-400 mb-3">{alert.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>🕒 {alert.timestamp}</span>
                  <span>📋 Anomaly: {alert.anomalyId}</span>
                </div>
              </div>
            </div>

            {/* Swarm Recommendation */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-blue-400 mb-1">Swarm Recommendation</div>
                  <div className="text-sm text-gray-400">{alert.swarmRecommendation}</div>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-white mb-2">Recommended Actions</div>
              <div className="flex flex-wrap gap-2">
                {alert.actions.map((action, i) => (
                  <button
                    key={i}
                    className="bg-green-500/20 text-green-300 px-3 py-1 rounded text-sm hover:bg-green-500/30 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {alert.status === 'new' && (
                <>
                  <Button 
                    variant="primary" 
                    onClick={() => handleAcknowledge(alert.id)}
                    className="text-sm"
                  >
                    Acknowledge
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleResolve(alert.id)}
                    className="text-sm"
                  >
                    Resolve
                  </Button>
                </>
              )}
              {alert.status === 'acknowledged' && (
                <Button 
                  variant="primary" 
                  onClick={() => handleResolve(alert.id)}
                  className="text-sm"
                >
                  Mark Resolved
                </Button>
              )}
              <Button 
                variant="secondary" 
                icon={MessageSquare} 
                className="text-sm"
                onClick={() => {
                  const note = prompt('Add a note for this alert:');
                  if (note) {
                    window.alert(`Note added: ${note}`);
                  }
                }}
              >
                Add Note
              </Button>
              <Button 
                variant="secondary" 
                icon={Download} 
                className="text-sm"
                onClick={() => {
                  const alertData = JSON.stringify(alert, null, 2);
                  const blob = new Blob([alertData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `alert-${alert.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Alerts</h3>
          <p className="text-gray-400">No alerts match the selected filter.</p>
        </Card>
      )}
    </div>
  );
};

export default AlertsDeliveryPage;
