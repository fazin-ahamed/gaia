import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  BarChart3, 
  Map, 
  Users, 
  Brain, 
  Shield, 
  TrendingUp, 
  Clock, 
  Eye,
  Filter,
  RefreshCw,
  Plus,
  Globe,
  Zap
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import SeverityBadge from '../components/SeverityBadge';
import { Link } from 'react-router-dom';

interface SwarmConsensus {
  agentCount: number;
  consensusScore: number;
  confidence: number;
  status: 'reaching_consensus' | 'consensus_reached' | 'conflict_detected';
}

interface GlobalAnomaly {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  swarmConsensus: SwarmConsensus;
  location: { lat: number; lng: number; name: string };
  timestamp: string;
  modality: 'Text' | 'Image' | 'Audio' | 'Video' | 'Sensor';
  source: string;
  tags: string[];
  mitigationStatus: 'pending' | 'in_progress' | 'completed';
  impactScore: number;
}

const UserDashboard: React.FC = () => {
  const [anomalies, setAnomalies] = useState<GlobalAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedModality, setSelectedModality] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('Global');
  const [sortBy, setSortBy] = useState<string>('timestamp');

  const [swarmMetrics, setSwarmMetrics] = useState({
    activeAgents: 156,
    consensusRate: 94.7,
    processingSpeed: 2.3, // anomalies per second
    accuracyScore: 98.2,
    conflictResolutionRate: 91.4,
    federatedNodes: 23
  });

  const [criticalAlerts, setCriticalAlerts] = useState([
    {
      id: 'alert-001',
      title: 'Pacific Ring of Fire Seismic Swarm',
      confidence: 92,
      swarmConsensus: 89,
      location: 'Pacific Ocean',
      timeAgo: '2 minutes ago',
      requiresAttention: true,
      riskLevel: 'Extreme'
    },
    {
      id: 'alert-002',
      title: 'European Power Grid Anomaly',
      confidence: 78,
      swarmConsensus: 85,
      location: 'Western Europe',
      timeAgo: '8 minutes ago',
      requiresAttention: true,
      riskLevel: 'High'
    }
  ]);

  useEffect(() => {
    // Simulate loading initial data
    setTimeout(() => {
      setAnomalies([
        {
          id: 'ANOM-001',
          title: 'Unusual Atmospheric Disturbance Pattern',
          severity: 'Critical',
          confidence: 0.92,
          swarmConsensus: {
            agentCount: 47,
            consensusScore: 0.89,
            confidence: 0.91,
            status: 'consensus_reached'
          },
          location: { lat: 37.7749, lng: -122.4194, name: 'San Francisco Bay Area' },
          timestamp: '2 minutes ago',
          modality: 'Image',
          source: 'Satellite Imagery',
          tags: ['atmospheric', 'unusual', 'bay_area'],
          mitigationStatus: 'pending',
          impactScore: 85
        },
        {
          id: 'ANOM-002',
          title: 'Seismic Activity Spike in Japan Trench',
          severity: 'High',
          confidence: 0.78,
          swarmConsensus: {
            agentCount: 34,
            consensusScore: 0.85,
            confidence: 0.82,
            status: 'consensus_reached'
          },
          location: { lat: 36.7378, lng: 138.7840, name: 'Japan Trench' },
          timestamp: '5 minutes ago',
          modality: 'Sensor',
          source: 'USGS Network',
          tags: ['seismic', 'tectonic', 'japan'],
          mitigationStatus: 'in_progress',
          impactScore: 72
        },
        {
          id: 'ANOM-003',
          title: 'Unidentified Aerial Phenomena Cluster',
          severity: 'Medium',
          confidence: 0.65,
          swarmConsensus: {
            agentCount: 28,
            consensusScore: 0.72,
            confidence: 0.68,
            status: 'reaching_consensus'
          },
          location: { lat: 50.1109, lng: 8.6821, name: 'German Airspace' },
          timestamp: '8 minutes ago',
          modality: 'Video',
          source: 'Radar Network',
          tags: ['uap', 'airspace', 'germany'],
          mitigationStatus: 'pending',
          impactScore: 45
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (selectedSeverity !== 'All' && anomaly.severity !== selectedSeverity) return false;
    if (selectedModality !== 'All' && anomaly.modality !== selectedModality) return false;
    if (selectedRegion !== 'Global' && !anomaly.location.name.toLowerCase().includes(selectedRegion.toLowerCase())) return false;
    return true;
  });

  const sortedAnomalies = [...filteredAnomalies].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence;
      case 'severity':
        const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case 'timestamp':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getConsensusStatusColor = (status: string) => {
    switch (status) {
      case 'consensus_reached': return 'text-green-400';
      case 'reaching_consensus': return 'text-yellow-400';
      case 'conflict_detected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Global Anomaly Dashboard</h1>
              <p className="text-gray-400 mt-1">Real-time planetary threat monitoring and swarm consensus analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="secondary" icon={RefreshCw} onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Link to="/report">
                <Button variant="primary" icon={Plus}>
                  Report Anomaly
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Swarm Activity Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="text-center py-4">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{swarmMetrics.activeAgents}</div>
            <div className="text-sm text-gray-400">Active Agents</div>
          </Card>
          <Card className="text-center py-4">
            <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{swarmMetrics.consensusRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Consensus Rate</div>
          </Card>
          <Card className="text-center py-4">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{swarmMetrics.processingSpeed}</div>
            <div className="text-sm text-gray-400">Anomalies/sec</div>
          </Card>
          <Card className="text-center py-4">
            <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{swarmMetrics.accuracyScore.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Accuracy Score</div>
          </Card>
          <Card className="text-center py-4">
            <Users className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{swarmMetrics.federatedNodes}</div>
            <div className="text-sm text-gray-400">Federated Nodes</div>
          </Card>
          <Card className="text-center py-4">
            <Eye className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{swarmMetrics.conflictResolutionRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Conflict Resolution</div>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Critical Alerts</h2>
            <div className="grid gap-4">
              {criticalAlerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-red-500 bg-red-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.riskLevel === 'Extreme' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {alert.riskLevel} Risk
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <span>📍 {alert.location}</span>
                        <span>🕒 {alert.timeAgo}</span>
                        <span>🤖 Consensus: {alert.swarmConsensus}%</span>
                        <span>🎯 Confidence: {alert.confidence}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button variant="danger" className="text-sm">
                        Immediate Response
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Modalities</option>
              <option value="Text">Text</option>
              <option value="Image">Image</option>
              <option value="Video">Video</option>
              <option value="Audio">Audio</option>
              <option value="Sensor">Sensor</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Global">Global</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Africa">Africa</option>
              <option value="South America">South America</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="timestamp">Latest</option>
              <option value="confidence">Highest Confidence</option>
              <option value="severity">Highest Severity</option>
            </select>
          </div>
        </div>

        {/* Anomalies Grid */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Analyzing global anomaly data...</p>
            </div>
          ) : (
            <>
              {sortedAnomalies.map((anomaly) => (
                <Card key={anomaly.id} className="hover:bg-white/5 transition-all duration-300 border border-white/10">
                  <Link to={`/incident/${anomaly.id}`} className="block">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">
                            {anomaly.title}
                          </h3>
                          <SeverityBadge severity={anomaly.severity as any} />
                          <div className={`text-sm font-medium ${getConsensusStatusColor(anomaly.swarmConsensus.status)}`}>
                            {anomaly.swarmConsensus.status === 'consensus_reached' && '✅ Consensus'}
                            {anomaly.swarmConsensus.status === 'reaching_consensus' && '🔄 Reaching Consensus'}
                            {anomaly.swarmConsensus.status === 'conflict_detected' && '⚠️ Conflict Detected'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Globe className="w-4 h-4" />
                            <span>📍 {anomaly.location.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>🕒 {anomaly.timestamp}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">🎯</span>
                            <span className="text-white font-medium">{(anomaly.confidence * 100).toFixed(0)}% Confidence</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">🤖</span>
                            <span className="text-white font-medium">{(anomaly.swarmConsensus.consensusScore * 100).toFixed(0)}% Consensus</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-xs text-gray-500">Modality: {anomaly.modality}</span>
                          <span className="text-xs text-gray-500">Source: {anomaly.source}</span>
                          <span className="text-xs text-gray-500">Impact: {anomaly.impactScore}/100</span>
                          <div className="flex space-x-1">
                            {anomaly.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-400">
                                {tag}
                              </span>
                            ))}
                            {anomaly.tags.length > 3 && (
                              <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-400">
                                +{anomaly.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-3xl font-bold text-white">
                          {(anomaly.confidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">Confidence</div>
                        
                        <div className="w-16 bg-gray-700 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${anomaly.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
              
              {sortedAnomalies.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No anomalies match your current filters.</p>
                  <Button variant="secondary" onClick={() => {
                    setSelectedSeverity('All');
                    setSelectedModality('All');
                    setSelectedRegion('Global');
                  }} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;