
import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import SeverityBadge from '../components/SeverityBadge';
import Button from '../components/Button';
import Tooltip from '../components/Tooltip';
import InteractiveMap from '../components/InteractiveMap';
import { mockAnomalies } from '../data/mockData';
import { Anomaly, Severity } from '../types';
import { MapPin, Clock, Filter, Bell, UserCheck, UploadCloud, Settings, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../src/hooks/useWebSocket';

const AnomalyCard: React.FC<{ anomaly: Anomaly }> = ({ anomaly }) => (
    <Link to={`/incident/${anomaly.id}`} className="block hover:bg-gaia-light/50 rounded-lg transition-colors duration-200">
        <div className="p-4 border-b border-gaia-light">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-white pr-4">{anomaly.title}</h3>
                <SeverityBadge severity={anomaly.severity} showIcon={false} />
            </div>
            <p className="text-sm text-gray-400 mt-1 truncate">{anomaly.description}</p>
            <div className="flex items-center text-xs text-gray-500 mt-3 space-x-4">
                <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{anomaly.location.name}</span>
                </div>
                <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{new Date(anomaly.timestamp).toLocaleString()}</span>
                </div>
            </div>
        </div>
    </Link>
);

const Dashboard: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(mockAnomalies);
  const [filter, setFilter] = useState<Severity | 'All'>('All');
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // WebSocket connection for real-time updates
  const { isConnected, lastMessage, subscribe } = useWebSocket();

  const filteredAnomalies = anomalies.filter(a => filter === 'All' || a.severity === filter);

  // Subscribe to real-time updates
  useEffect(() => {
    if (isConnected) {
      subscribe(['anomalies', 'alerts', 'system']);
    }
  }, [isConnected, subscribe]);

  // Handle real-time messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'new_anomaly':
          const newAnomaly = lastMessage.data;
          setAnomalies(prev => [newAnomaly, ...prev]);
          addNotification({
            type: 'new_anomaly',
            title: 'New Anomaly Detected',
            message: `${newAnomaly.title} (${newAnomaly.severity})`,
            timestamp: new Date()
          });
          break;
        case 'anomaly_update':
          setAnomalies(prev => prev.map(a =>
            a.id === lastMessage.data.anomalyId
              ? { ...a, ...lastMessage.data.updates }
              : a
          ));
          break;
        case 'high_severity_alert':
          addNotification({
            type: 'alert',
            title: 'High Severity Alert',
            message: lastMessage.data.title,
            severity: 'high',
            timestamp: new Date()
          });
          break;
      }
    }
  }, [lastMessage]);

  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
  };

  // Simulate real-time updates (fallback when WebSocket not available)
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        // Add a small chance of a new anomaly appearing
        if (Math.random() > 0.8) {
          const newAnomaly = { ...mockAnomalies[Math.floor(Math.random() * mockAnomalies.length)], id: `ANOM-${Date.now()}`, timestamp: new Date().toISOString() };
          setAnomalies(prev => [newAnomaly, ...prev]);
          addNotification({
            type: 'new_anomaly',
            title: 'New Anomaly Detected',
            message: `${newAnomaly.title}`,
            timestamp: new Date()
          });
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const toggleAutonomousMode = () => {
    setAutonomousMode(!autonomousMode);
    // In a real app, this would send a request to the backend
  };

  return (
    <div className="p-8">
      <PageHeader title="Global Dashboard" subtitle="Real-time overview of detected anomalies worldwide.">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className={`w-4 h-4 ${autonomousMode ? 'text-green-400' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-400">Autonomous Mode</span>
            <button
              onClick={toggleAutonomousMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                autonomousMode ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autonomousMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <Link to="/report">
              <Button variant="primary" icon={UploadCloud}>Report Anomaly</Button>
          </Link>
          <Link to="/review/ANOM-001">
              <Button variant="secondary" icon={UserCheck}>Review Pending ({anomalies.filter(a => a.status === 'Pending Review').length})</Button>
          </Link>
          <Link to="/settings">
              <Button variant="secondary" icon={Settings}>Settings</Button>
          </Link>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Anomalies Feed */}
        <div className="lg:col-span-2">
            <Card className="!p-0">
                <div className="p-6 border-b border-gaia-light">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Live Anomalies Feed</h2>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as Severity | 'All')}
                                className="bg-gaia-dark border border-gaia-light rounded-md px-2 py-1 text-sm focus:ring-gaia-accent focus:border-gaia-accent"
                            >
                                <option value="All">All Severities</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {filteredAnomalies.length > 0 ? (
                        filteredAnomalies.map(anomaly => <AnomalyCard key={anomaly.id} anomaly={anomaly} />)
                    ) : (
                        <div className="p-8 text-center text-gray-500">No anomalies match the current filter.</div>
                    )}
                </div>
            </Card>
        </div>
        
        {/* Map and Notifications */}
        <div>
          <div className="space-y-8">
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">Global Hotspots</h2>
              <div className="bg-gaia-dark rounded-lg h-64">
                <InteractiveMap
                  anomalies={filteredAnomalies}
                  onAnomalyClick={(anomaly) => {
                    // Navigate to anomaly details
                    window.location.href = `/incident/${anomaly.id}`;
                  }}
                />
              </div>
            </Card>
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="space-y-3 text-sm max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div key={index} className={`p-3 rounded-md ${
                      notification.type === 'alert' && notification.severity === 'high'
                        ? 'bg-red-900/50 border border-red-500/30'
                        : notification.type === 'new_anomaly'
                        ? 'bg-yellow-900/50 border border-yellow-500/30'
                        : 'bg-gaia-dark/50'
                    }`}>
                      <p className="text-white font-medium">{notification.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-gaia-dark/50 rounded-md">
                    <p className="text-gray-300"><strong>System Status:</strong> All systems operational</p>
                    <p className="text-gray-500 text-xs">No new notifications</p>
                  </div>
                )}
                <div className="p-3 bg-gaia-dark/50 rounded-md">
                    <p className="text-gray-300"><strong>Connection Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}</p>
                    <p className="text-gray-500 text-xs">Real-time updates {isConnected ? 'active' : 'inactive'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
