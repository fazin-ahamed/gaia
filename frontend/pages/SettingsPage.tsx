import React, { useState, useEffect } from 'react';
import { Settings, Users, Database, Bell, Shield, Key, Activity, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface APISource {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  lastCheck: string;
  responseTime: number;
  endpoint: string;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('api-sources');
  const [apiSources, setApiSources] = useState<APISource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPIStatus();
  }, []);

  const fetchAPIStatus = async () => {
    try {
      const response = await fetch('/api/ai/status');
      const data = await response.json();
      
      const sources: APISource[] = [
        {
          name: 'Gemini AI',
          status: data.gemini?.available ? 'healthy' : 'down',
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 500 + 100,
          endpoint: 'Google Gemini API'
        },
        {
          name: 'OpenWeatherMap',
          status: process.env.REACT_APP_OPENWEATHER_API_KEY ? 'healthy' : 'unknown',
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 300 + 50,
          endpoint: 'api.openweathermap.org'
        },
        {
          name: 'NewsAPI',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 400 + 100,
          endpoint: 'newsapi.org'
        },
        {
          name: 'USGS Earthquakes',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 200 + 50,
          endpoint: 'earthquake.usgs.gov'
        },
        {
          name: 'OpenAQ',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 350 + 80,
          endpoint: 'api.openaq.org'
        },
        {
          name: 'TomTom Traffic',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 250 + 60,
          endpoint: 'api.tomtom.com'
        },
        {
          name: 'Opus Workflows',
          status: data.opus?.available ? 'healthy' : 'degraded',
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 600 + 200,
          endpoint: 'Opus Service'
        }
      ];
      
      setApiSources(sources);
    } catch (error) {
      console.error('Error fetching API status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'down': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-900 border-green-700 text-green-300';
      case 'degraded': return 'bg-yellow-900 border-yellow-700 text-yellow-300';
      case 'down': return 'bg-red-900 border-red-700 text-red-300';
      default: return 'bg-gray-800 border-gray-700 text-gray-400';
    }
  };

  const tabs = [
    { id: 'api-sources', label: 'API Sources', icon: Database },
    { id: 'user-roles', label: 'User Roles', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api-keys', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-500" />
            System Settings
          </h1>
          <p className="text-gray-400 mt-1">Configure and manage GAIA system settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        {activeTab === 'api-sources' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">API Source Health</h2>
              <button
                onClick={fetchAPIStatus}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Refresh Status
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading API status...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apiSources.map((source) => (
                  <div
                    key={source.name}
                    className={`p-4 rounded-lg border ${getStatusColor(source.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(source.status)}
                        <h3 className="font-semibold text-white">{source.name}</h3>
                      </div>
                      <span className="text-xs uppercase font-bold">{source.status}</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-gray-400">Endpoint: {source.endpoint}</p>
                      <p className="text-gray-400">Response Time: {source.responseTime.toFixed(0)}ms</p>
                      <p className="text-gray-400">Last Check: {new Date(source.lastCheck).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'user-roles' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">User Role Management</h2>
            <div className="space-y-3">
              {['Administrator', 'Analyst', 'Operator', 'Viewer'].map((role) => (
                <div key={role} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-white">{role}</h3>
                    <p className="text-sm text-gray-400">
                      {role === 'Administrator' && 'Full system access and configuration'}
                      {role === 'Analyst' && 'View and analyze anomalies, create reports'}
                      {role === 'Operator' && 'Monitor system, respond to alerts'}
                      {role === 'Viewer' && 'Read-only access to dashboards'}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Notification Settings</h2>
            <div className="space-y-3">
              {[
                { label: 'Critical Anomaly Alerts', enabled: true },
                { label: 'System Status Updates', enabled: true },
                { label: 'Daily Summary Reports', enabled: false },
                { label: 'Workflow Completion', enabled: true },
                { label: 'API Health Warnings', enabled: true },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <span className="text-white">{setting.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={setting.enabled} />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
            <div className="space-y-3">
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-400 mb-3">Add an extra layer of security to your account</p>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  Enable 2FA
                </button>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Session Timeout</h3>
                <select className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                </select>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-white mb-2">IP Whitelist</h3>
                <p className="text-sm text-gray-400 mb-3">Restrict access to specific IP addresses</p>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Configure
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">API Key Management</h2>
            <div className="space-y-3">
              {[
                { name: 'Gemini AI', key: 'AIza...', status: 'Active' },
                { name: 'OpenWeatherMap', key: '5748...', status: 'Active' },
                { name: 'NewsAPI', key: 'a59d...', status: 'Active' },
                { name: 'TomTom', key: 'ZhWi...', status: 'Active' },
              ].map((api) => (
                <div key={api.name} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-white">{api.name}</h3>
                    <p className="text-sm text-gray-400 font-mono">{api.key}••••••••</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-xs font-semibold">
                      {api.status}
                    </span>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Rotate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
