import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import SeverityBadge from '../components/SeverityBadge';
import Button from '../components/Button';
import { FileText, Image, Mic, Activity, Network, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AgentOutput {
  agentType: string;
  agentId: string;
  confidence: number;
  output: string;
  evidence: string[];
  timestamp: string;
}

const VerificationPage: React.FC = () => {
  const { id } = useParams();
  
  const [agentOutputs] = useState<AgentOutput[]>([
    {
      agentType: 'Text Analysis',
      agentId: 'text-agent-047',
      confidence: 0.92,
      output: 'Document analysis reveals anomalous communication patterns. Detected encrypted segments and unusual terminology consistent with classified operations. Cross-reference with known databases shows no matches.',
      evidence: ['Encrypted segments detected', 'Unusual terminology patterns', 'No database matches'],
      timestamp: '2 minutes ago'
    },
    {
      agentType: 'Image Analysis',
      agentId: 'img-agent-089',
      confidence: 0.89,
      output: 'Visual analysis confirms presence of unidentified objects with non-standard characteristics. Thermal signatures indicate unusual energy emissions. Object geometry does not match known aircraft or natural phenomena.',
      evidence: ['Non-standard object geometry', 'Unusual thermal signatures', 'No aircraft database match'],
      timestamp: '2 minutes ago'
    },
    {
      agentType: 'Audio Analysis',
      agentId: 'audio-agent-023',
      confidence: 0.78,
      output: 'Audio spectrum analysis reveals frequencies outside normal atmospheric range. Detected electromagnetic interference patterns. Sound profile inconsistent with known natural or man-made sources.',
      evidence: ['Abnormal frequency spectrum', 'EM interference detected', 'Unknown sound profile'],
      timestamp: '3 minutes ago'
    },
    {
      agentType: 'Sensor Data',
      agentId: 'sensor-agent-156',
      confidence: 0.85,
      output: 'Multiple sensor modalities confirm anomalous readings. Electromagnetic field fluctuations detected. Atmospheric pressure changes inconsistent with weather patterns. Seismic activity detected without geological explanation.',
      evidence: ['EM field fluctuations', 'Pressure anomalies', 'Unexplained seismic activity'],
      timestamp: '3 minutes ago'
    }
  ]);

  const [crossModalVerification] = useState({
    textImageConsensus: 0.91,
    textAudioConsensus: 0.84,
    imageAudioConsensus: 0.87,
    imageSensorConsensus: 0.92,
    overallConsensus: 0.89,
    conflictResolution: 'High agreement across all modalities. Minor discrepancies in audio analysis resolved through weighted consensus.',
    credibilityScore: 0.94
  });

  const [severityClassification] = useState({
    severity: 'High',
    reasoning: 'Multiple high-confidence detections across independent modalities. Cross-verification confirms anomalous characteristics. Potential national security implications.',
    riskFactors: [
      'Unidentified technology signatures',
      'Unusual energy emissions',
      'No database matches',
      'Multiple sensor confirmations'
    ],
    recommendedActions: [
      'Escalate to senior analysts',
      'Deploy additional monitoring',
      'Coordinate with relevant agencies',
      'Maintain continuous surveillance'
    ]
  });

  const getAgentIcon = (type: string) => {
    if (type.includes('Text')) return FileText;
    if (type.includes('Image')) return Image;
    if (type.includes('Audio')) return Mic;
    if (type.includes('Sensor')) return Activity;
    return Network;
  };

  const getAgentColor = (type: string) => {
    if (type.includes('Text')) return 'text-blue-400';
    if (type.includes('Image')) return 'text-purple-400';
    if (type.includes('Audio')) return 'text-green-400';
    if (type.includes('Sensor')) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gaia-dark p-6">
      <PageHeader 
        title={`Verification Analysis - ${id}`}
        subtitle="Cross-modality verification and agent consensus analysis"
      />

      {/* Overall Consensus */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Swarm Consensus Score</h2>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-400 mb-1">
              {(crossModalVerification.overallConsensus * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Overall Agreement</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {(crossModalVerification.textImageConsensus * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Text-Image</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {(crossModalVerification.textAudioConsensus * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Text-Audio</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {(crossModalVerification.imageAudioConsensus * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Image-Audio</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {(crossModalVerification.imageSensorConsensus * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Image-Sensor</div>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Network className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-white mb-1">Conflict Resolution</div>
              <div className="text-sm text-gray-400">{crossModalVerification.conflictResolution}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Agent Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {agentOutputs.map((agent, index) => {
          const Icon = getAgentIcon(agent.agentType);
          const colorClass = getAgentColor(agent.agentType);
          
          return (
            <Card key={index}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${colorClass}`} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{agent.agentType}</h3>
                    <div className="text-xs text-gray-500">{agent.agentId}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {(agent.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300">{agent.output}</p>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Key Evidence</div>
                <div className="space-y-2">
                  {agent.evidence.map((item, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Analyzed {agent.timestamp}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Severity Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-semibold text-white">Severity Classification</h3>
          </div>

          <div className="mb-4">
            <SeverityBadge severity={severityClassification.severity as any} className="text-lg px-4 py-2" />
          </div>

          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <div className="text-sm font-semibold text-white mb-2">Reasoning</div>
            <p className="text-sm text-gray-400">{severityClassification.reasoning}</p>
          </div>

          <div>
            <div className="text-sm font-semibold text-white mb-2">Risk Factors</div>
            <div className="space-y-2">
              {severityClassification.riskFactors.map((factor, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Credibility Assessment</h3>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Overall Credibility</span>
              <span className="text-3xl font-bold text-green-400">
                {(crossModalVerification.credibilityScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                style={{ width: `${crossModalVerification.credibilityScore * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white mb-3">Recommended Actions</div>
            <div className="space-y-2">
              {severityClassification.recommendedActions.map((action, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400">{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <Button variant="primary" className="flex-1">
              Approve & Escalate
            </Button>
            <Button variant="secondary" className="flex-1">
              Request Review
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerificationPage;
