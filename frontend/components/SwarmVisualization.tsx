import React, { useState, useEffect } from 'react';
import { Brain, Eye, Mic, Activity, Network, TrendingUp } from 'lucide-react';
import { apiService } from '../src/services/apiService';

interface Agent {
  id: string;
  type: 'text' | 'image' | 'audio' | 'sensor' | 'verification' | 'forecasting';
  status: 'active' | 'processing' | 'idle' | 'error';
  confidence: number;
  output?: string;
}

interface SwarmVisualizationProps {
  anomalyId?: string;
  showDetails?: boolean;
  realData?: boolean;
}

const SwarmVisualization: React.FC<SwarmVisualizationProps> = ({ anomalyId, showDetails = false, realData = true }) => {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'text-001', type: 'text', status: 'active', confidence: 0.92, output: 'Anomalous pattern detected in text data' },
    { id: 'text-002', type: 'text', status: 'processing', confidence: 0.87 },
    { id: 'img-001', type: 'image', status: 'active', confidence: 0.89, output: 'Visual anomaly confirmed' },
    { id: 'img-002', type: 'image', status: 'active', confidence: 0.91 },
    { id: 'audio-001', type: 'audio', status: 'processing', confidence: 0.78 },
    { id: 'sensor-001', type: 'sensor', status: 'active', confidence: 0.85 },
    { id: 'verify-001', type: 'verification', status: 'active', confidence: 0.94, output: 'Cross-modal verification passed' },
    { id: 'forecast-001', type: 'forecasting', status: 'processing', confidence: 0.82 },
  ]);

  const [consensusScore, setConsensusScore] = useState(0.89);

  useEffect(() => {
    if (realData) {
      // Fetch real agent data from API
      const fetchRealData = async () => {
        try {
          const hotspots = await apiService.fetchHotspots();
          if (hotspots && hotspots.length > 0) {
            const firstHotspot = hotspots[0];
            if (firstHotspot.analysis && firstHotspot.analysis.agents) {
              const realAgents = firstHotspot.analysis.agents.map((agent: any, index: number) => ({
                id: agent.agentId || `agent-${index}`,
                type: agent.type as any,
                status: 'active' as const,
                confidence: agent.confidence,
                output: agent.output
              }));
              setAgents(realAgents);
              setConsensusScore(firstHotspot.analysis.consensus);
            }
          }
        } catch (error) {
          console.error('Failed to fetch real agent data:', error);
        }
      };

      fetchRealData();
      const interval = setInterval(fetchRealData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    } else {
      // Simulated updates for demo
      const interval = setInterval(() => {
        setAgents(prev => prev.map(agent => ({
          ...agent,
          status: Math.random() > 0.7 ? 'processing' : 'active',
          confidence: Math.min(0.99, agent.confidence + (Math.random() - 0.5) * 0.05)
        })));
        setConsensusScore(prev => Math.min(0.99, Math.max(0.7, prev + (Math.random() - 0.5) * 0.03)));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [realData]);

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'text': return Brain;
      case 'image': return Eye;
      case 'audio': return Mic;
      case 'sensor': return Activity;
      case 'verification': return Network;
      case 'forecasting': return TrendingUp;
      default: return Brain;
    }
  };

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'text': return 'text-blue-400';
      case 'image': return 'text-purple-400';
      case 'audio': return 'text-green-400';
      case 'sensor': return 'text-yellow-400';
      case 'verification': return 'text-pink-400';
      case 'forecasting': return 'text-indigo-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500 animate-pulse';
      case 'idle': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gaia-card rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Agent Swarm Activity</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">{agents.filter(a => a.status === 'active').length} Active</span>
        </div>
      </div>

      {/* Consensus Score */}
      <div className="mb-6 bg-black/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Swarm Consensus</span>
          <span className="text-2xl font-bold text-white">{(consensusScore * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${consensusScore * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const Icon = getAgentIcon(agent.type);
          return (
            <div 
              key={agent.id}
              className="bg-black/30 rounded-lg p-4 hover:bg-black/50 transition-all cursor-pointer relative"
            >
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
              <Icon className={`w-8 h-8 ${getAgentColor(agent.type)} mb-2`} />
              <div className="text-xs text-gray-500 uppercase mb-1">{agent.type}</div>
              <div className="text-sm font-semibold text-white">{(agent.confidence * 100).toFixed(0)}%</div>
              {showDetails && agent.output && (
                <div className="text-xs text-gray-400 mt-2 line-clamp-2">{agent.output}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Agent Type Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-400">{agents.filter(a => a.type === 'text').length}</div>
          <div className="text-xs text-gray-500">Text Agents</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-400">{agents.filter(a => a.type === 'image').length}</div>
          <div className="text-xs text-gray-500">Visual Agents</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">{agents.filter(a => a.type === 'audio').length}</div>
          <div className="text-xs text-gray-500">Audio Agents</div>
        </div>
      </div>
    </div>
  );
};

export default SwarmVisualization;
