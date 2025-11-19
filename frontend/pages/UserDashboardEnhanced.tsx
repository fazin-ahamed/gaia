import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import SeverityBadge from '../components/SeverityBadge';
import SwarmVisualization from '../components/SwarmVisualization';
import GlobalRiskScoring from '../components/GlobalRiskScoring';
import Button from '../components/Button';
import { AlertTriangle, Filter, RefreshCw, Download, Eye } from 'lucide-react';
import { apiService } from '../src/services/apiService';

interface Anomaly {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  swarmConsensus: number;
  location: string;
  timestamp: string;
  status: string;
  modalities: string[];
}

const UserDashboardEnhanced: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeAnomalies: 0,
    swarmConsensus: 0,
    activeAgents: 156,
    criticalAlerts: 0
  });

  useEffect(() => {
    fetchAnomalies();
    fetchStats();
    const interval = setInterval(() => {
      fetchAnomalies();
      fetchStats();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const dashboardStats = await apiService.getDashboardStats();
      if (dashboardStats) {
        setStats({
          activeAnomalies: dashboardStats.activeAnomalies || 0,
          swarmConsensus: parseFloat(dashboardStats.consensusRate) || 0,
          activeAgents: dashboardStats.activeAgents || 156,
          criticalAlerts: dashboardStats.criticalAlerts || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      
      // Fetch real anomalies from database
      const realAnomalies = await apiService.fetchAnomalies();
      
      if (realAnomalies && realAnomalies.length > 0) {
        // Use real anomalies from database
        const convertedAnomalies: Anomaly[] = realAnomalies.map((anomaly: any) => ({
          id: anomaly.id,
          title: anomaly.title,
          description: anomaly.description || 'No description available',
          severity: anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1),
          confidence: anomaly.confidence,
          swarmConsensus: anomaly.confidence,
          location: anomaly.location?.address || anomaly.location?.lat ? 
            `${anomaly.location.lat?.toFixed(2)}, ${anomaly.location.lng?.toFixed(2)}` : 
            'Unknown',
          timestamp: new Date(anomaly.timestamp).toLocaleString(),
          status: anomaly.status === 'detected' ? 'Active' : 
                  anomaly.status === 'processing' ? 'Processing' : 
                  'Monitoring',
          modalities: anomaly.modalities?.type ? [anomaly.modalities.type] : ['multi-modal']
        }));
        
        setAnomalies(convertedAnomalies);
      } else {
        // Fallback to hotspots if no real anomalies
        const hotspots = await apiService.fetchHotspots();
        
        const convertedAnomalies: Anomaly[] = hotspots.map((hotspot, index) => ({
          id: `hotspot-${index}`,
          title: `${hotspot.severity} Anomaly Detected in ${hotspot.name}`,
          description: hotspot.analysis?.agents?.map((a: any) => a.output).join('. ') || 'Multi-modal analysis in progress',
          severity: hotspot.severity,
          confidence: hotspot.analysis?.consensus || 0.5,
          swarmConsensus: hotspot.analysis?.consensus || 0.5,
          location: hotspot.name,
          timestamp: new Date(hotspot.analysis?.timestamp || Date.now()).toLocaleString(),
          status: hotspot.severity === 'High' || hotspot.severity === 'Critical' ? 'Active' : 'Monitoring',
          modalities: hotspot.analysis?.agents?.map((a: any) => a.type) || ['sensor']
        }));
        
        setAnomalies(convertedAnomalies);
      }
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
      // Fallback to demo data
      setAnomalies([
        {
          id: 'anom-001',
          title: 'Unusual Seismic Activity Pattern',
          description: 'Multiple low-frequency tremors detected in non-seismic zone',
          severity: 'Critical',
          confidence: 0.94,
          swarmConsensus: 0.91,
          location: 'Pacific Northwest',
          timestamp: '2 minutes ago',
          status: 'Active',
          modalities: ['Sensor', 'Satellite', 'Audio']
        },
    {
      id: 'anom-002',
      title: 'Atmospheric Anomaly Detected',
      description: 'Unexpected pressure changes and temperature fluctuations',
      severity: 'High',
      confidence: 0.87,
      swarmConsensus: 0.85,
      location: 'North Atlantic',
      timestamp: '15 minutes ago',
      status: 'Processing',
      modalities: ['Sensor', 'Satellite']
    },
    {
      id: 'anom-003',
      title: 'Unidentified Aerial Phenomena',
      description: 'Multiple radar contacts with unusual flight characteristics',
      severity: 'High',
      confidence: 0.82,
      swarmConsensus: 0.79,
      location: 'European Airspace',
      timestamp: '1 hour ago',
      status: 'Under Review',
      modalities: ['Radar', 'Visual', 'Video']
    },
    {
      id: 'anom-004',
      title: 'Electromagnetic Interference Spike',
      description: 'Widespread communication disruptions in urban area',
      severity: 'Medium',
      confidence: 0.76,
      swarmConsensus: 0.73,
      location: 'Tokyo Metropolitan',
      timestamp: '2 hours ago',
      status: 'Resolved',
      modalities: ['Sensor', 'Text']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnomalies();
    setRefreshing(false);
  };

  const filteredAnomalies = severityFilter === 'All' 
    ? anomalies 
    : anomalies.filter(a => a.severity === severityFilter);

  return (
    <div className="min-h-screen bg-gaia-dark p-6">
      <PageHeader 
        title="Command Dashboard" 
        subtitle="Real-time anomaly detection powered by agent swarm consensus"
      />

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">{stats.activeAnomalies}</div>
          <div className="text-sm text-gray-400">Active Anomalies</div>
          <div className="text-xs text-green-400 mt-1">Real-time data</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-400 mb-1">{stats.swarmConsensus.toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Swarm Consensus</div>
          <div className="text-xs text-gray-500 mt-1">Across all agents</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">{stats.activeAgents}</div>
          <div className="text-sm text-gray-400">Agents Online</div>
          <div className="text-xs text-gray-500 mt-1">All systems operational</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-400 mb-1">{stats.criticalAlerts}</div>
          <div className="text-sm text-gray-400">Critical Alerts</div>
          <div className="text-xs text-red-400 mt-1">{stats.criticalAlerts > 0 ? 'Requires attention' : 'All clear'}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Swarm Activity */}
        <div className="lg:col-span-2">
          <SwarmVisualization showDetails={true} />
        </div>

        {/* Global Risk */}
        <div>
          <GlobalRiskScoring />
        </div>
      </div>

      {/* Anomalies Feed */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Global Anomalies Feed</h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-gaia-card border border-white/10 rounded px-3 py-1 text-sm text-white"
              >
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <Button 
              variant="secondary" 
              icon={RefreshCw} 
              onClick={handleRefresh}
              className={refreshing ? 'animate-spin' : ''}
            >
              Refresh
            </Button>
            <Button variant="secondary" icon={Download}>
              Export
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAnomalies.map((anomaly) => (
            <div 
              key={anomaly.id}
              className="bg-black/30 rounded-lg p-5 hover:bg-black/50 transition-all border border-white/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Link 
                      to={`/incident/${anomaly.id}`}
                      className="text-xl font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {anomaly.title}
                    </Link>
                    <SeverityBadge severity={anomaly.severity} />
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{anomaly.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>📍 {anomaly.location}</span>
                    <span>🕒 {anomaly.timestamp}</span>
                    <span>📊 Status: {anomaly.status}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {(anomaly.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 mb-2">Confidence</div>
                  <div className="text-sm font-semibold text-purple-400">
                    {(anomaly.swarmConsensus * 100).toFixed(0)}% Consensus
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {anomaly.modalities.map((mod, i) => (
                    <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      {mod}
                    </span>
                  ))}
                </div>
                <Link to={`/incident/${anomaly.id}`}>
                  <Button variant="primary" icon={Eye} className="text-sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UserDashboardEnhanced;
