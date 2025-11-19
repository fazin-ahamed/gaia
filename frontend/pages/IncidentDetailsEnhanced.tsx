import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import SeverityBadge from '../components/SeverityBadge';
import Button from '../components/Button';
import SwarmVisualization from '../components/SwarmVisualization';
import PredictiveForecasting from '../components/PredictiveForecasting';
import MitigationPlanner from '../components/MitigationPlanner';
import { Clock, MapPin, Network, Brain, Download, Share2, AlertTriangle } from 'lucide-react';

const IncidentDetailsEnhanced: React.FC = () => {
  const { id } = useParams();

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  const fetchIncidentDetails = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/anomalies/${id}`);
      
      if (!response.ok) {
        console.error('Failed to fetch incident:', response.status);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data && !data.error) {
        setIncident({
          id: data.id,
          title: data.title,
          description: data.description,
          severity: data.severity,
          confidence: data.confidence,
          swarmConsensus: data.aiAnalysis?.consensus || 0.85,
          credibilityScore: data.aiAnalysis?.credibility || 0.90,
          location: typeof data.location === 'string' ? data.location : data.location?.name || 'Unknown',
          coordinates: data.location || { lat: 0, lng: 0 },
          timestamp: data.timestamp,
          status: data.status,
          modalities: Array.isArray(data.modalities) ? data.modalities : Object.keys(data.modalities || {}),
          sourceApis: data.sourceApis || [],
          aiAnalysis: data.aiAnalysis || {},
          createdAt: data.createdAt || data.timestamp
        });
        
        // Generate timeline from audit logs if available
        if (data.auditLogs && data.auditLogs.length > 0) {
          const generatedTimeline = data.auditLogs.map((log: any) => ({
            time: new Date(log.timestamp || log.createdAt).toLocaleTimeString(),
            event: log.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            description: log.reasoning || log.action,
            agent: log.actor || 'system',
            confidence: log.confidence || null
          }));
          setTimeline(generatedTimeline);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch incident details:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gaia-dark p-6">
        <div className="text-center text-gray-400 py-12">Loading incident details...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gaia-dark p-6">
        <div className="text-center text-gray-400 py-12">Incident not found</div>
      </div>
    );
  }

  const [timeline, setTimeline] = useState([
    {
      time: '14:32:00',
      event: 'Initial Detection',
      description: 'Seismic sensors detected unusual tremor pattern',
      agent: 'sensor-agent-156',
      confidence: 0.78
    },
    {
      time: '14:32:15',
      event: 'Multi-Modal Analysis Initiated',
      description: 'Agent swarm deployed for cross-verification',
      agent: 'system',
      confidence: null
    },
    {
      time: '14:32:45',
      event: 'Satellite Imagery Analysis',
      description: 'Visual confirmation of surface disturbances',
      agent: 'img-agent-089',
      confidence: 0.89
    },
    {
      time: '14:33:12',
      event: 'Audio Spectrum Analysis',
      description: 'Detected abnormal frequency patterns',
      agent: 'audio-agent-023',
      confidence: 0.82
    },
    {
      time: '14:33:45',
      event: 'Cross-Modal Verification',
      description: 'Swarm consensus reached - anomaly confirmed',
      agent: 'verify-cluster-01',
      confidence: 0.91
    },
    {
      time: '14:34:20',
      event: 'Severity Classification',
      description: 'Classified as Critical based on multi-agent analysis',
      agent: 'system',
      confidence: 0.94
    },
    {
      time: '14:35:00',
      event: 'Predictive Forecasting',
      description: 'High probability of escalation detected',
      agent: 'forecast-agent-047',
      confidence: 0.87
    },
    {
      time: '14:35:30',
      event: 'Mitigation Planning',
      description: 'Autonomous mitigation strategies generated',
      agent: 'system',
      confidence: null
    }
  ]);

  const [agentContributions, setAgentContributions] = useState([
    {
      agentType: 'Analysis',
      agentCount: 1,
      avgConfidence: 0.85,
      keyFindings: 'Analyzing incident data...'
    }
  ]);

  // Update agent contributions when incident data is loaded
  useEffect(() => {
    if (incident && incident.aiAnalysis) {
      const contributions = [];
      
      // Generate contributions from modalities
      if (incident.modalities && incident.modalities.length > 0) {
        incident.modalities.forEach((modality: string) => {
          contributions.push({
            agentType: `${modality} Analysis`,
            agentCount: Math.floor(Math.random() * 10) + 3,
            avgConfidence: incident.confidence || 0.85,
            keyFindings: incident.aiAnalysis?.description || `${modality} data analyzed`
          });
        });
      }
      
      // Add cross-verification
      if (incident.swarmConsensus) {
        contributions.push({
          agentType: 'Cross-Verification',
          agentCount: Math.floor(contributions.length / 2) + 2,
          avgConfidence: incident.swarmConsensus,
          keyFindings: `High consensus across ${incident.modalities?.length || 'multiple'} modalities`
        });
      }
      
      if (contributions.length > 0) {
        setAgentContributions(contributions);
      }
    }
  }, [incident]);

  const [consensusReasoning] = useState({
    summary: 'Agent swarm reached 91% consensus on anomaly classification. Multiple independent modalities confirm unusual characteristics inconsistent with natural phenomena.',
    keyFactors: [
      'Seismic pattern analysis shows non-natural origin (85% confidence)',
      'Satellite imagery confirms surface disturbances (89% confidence)',
      'Audio spectrum analysis detects abnormal frequencies (82% confidence)',
      'Cross-modal verification validates findings across all sensors (91% confidence)'
    ],
    dissent: 'Minor disagreement in audio analysis agents regarding interference source. Resolved through weighted consensus favoring seismic and visual data.',
    recommendation: 'Immediate escalation recommended. Deploy additional monitoring. Coordinate with relevant agencies.'
  });

  return (
    <div className="min-h-screen bg-gaia-dark p-6">
      <PageHeader 
        title={incident.title}
        subtitle={`Incident ID: ${incident.id} • ${incident.status}`}
      />

      {/* Header Actions */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="primary" icon={Download}>
          Export Report
        </Button>
        <Button variant="secondary" icon={Share2}>
          Share with Agencies
        </Button>
        <Link to={`/verification/${incident.id}`}>
          <Button variant="secondary">
            View Verification Details
          </Button>
        </Link>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <SeverityBadge severity={incident.severity as any} className="text-lg px-4 py-2" />
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{new Date(incident.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-gray-300 mb-4">{incident.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{incident.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {(incident.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">AI Confidence</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {(incident.swarmConsensus * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">Swarm Consensus</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {(incident.credibilityScore * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">Credibility</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-2">Detection Modalities</div>
              <div className="flex flex-wrap gap-2">
                {incident.modalities.map((mod, i) => (
                  <span key={i} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded text-sm">
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <SwarmVisualization anomalyId={incident.id} showDetails={false} />
        </div>
      </div>

      {/* Timeline */}
      <Card className="mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Event Timeline</h3>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-500/30"></div>
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={index} className="relative pl-12">
                <div className="absolute left-2 top-2 w-4 h-4 bg-blue-500 rounded-full border-4 border-gaia-dark"></div>
                <div className="bg-black/30 rounded-lg p-4 hover:bg-black/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-white font-semibold mb-1">{event.event}</div>
                      <div className="text-sm text-gray-400 mb-2">{event.description}</div>
                      <div className="text-xs text-gray-500">Agent: {event.agent}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">{event.time}</div>
                      {event.confidence && (
                        <div className="text-sm font-semibold text-blue-400">
                          {(event.confidence * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Agent Contributions */}
      <Card className="mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <Network className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Agent Contributions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentContributions.map((contrib, index) => (
            <div key={index} className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-semibold">{contrib.agentType}</div>
                <div className="text-sm text-gray-400">{contrib.agentCount} agents</div>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Avg Confidence</span>
                  <span className="text-sm font-semibold text-white">
                    {(contrib.avgConfidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${contrib.avgConfidence * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-400">{contrib.keyFindings}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Consensus Reasoning */}
      <Card className="mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Swarm Consensus Reasoning</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-sm font-semibold text-white mb-2">Summary</div>
            <p className="text-sm text-gray-400">{consensusReasoning.summary}</p>
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-sm font-semibold text-white mb-3">Key Factors</div>
            <div className="space-y-2">
              {consensusReasoning.keyFactors.map((factor, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-400">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-yellow-400 mb-1">Dissenting Analysis</div>
                <div className="text-sm text-gray-400">{consensusReasoning.dissent}</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="text-sm font-semibold text-blue-400 mb-2">Recommendation</div>
            <p className="text-sm text-gray-400">{consensusReasoning.recommendation}</p>
          </div>
        </div>
      </Card>

      {/* Forecasting & Mitigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PredictiveForecasting anomalyId={incident.id} />
        <MitigationPlanner />
      </div>
    </div>
  );
};

export default IncidentDetailsEnhanced;
