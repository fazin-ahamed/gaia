import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import SeverityBadge from '../components/SeverityBadge';
import { 
  Shield, 
  Brain, 
  Network, 
  AlertTriangle, 
  Map, 
  Zap, 
  Users, 
  Globe, 
  TrendingUp,
  Download,
  Play,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [swarmActivity, setSwarmActivity] = useState({
    activeAgents: 156,
    consensusRate: 94.7,
    anomaliesProcessed: 1247,
    globalCoverage: 92
  });

  const [demoAnomalies, setDemoAnomalies] = useState([
    {
      id: 'demo-001',
      title: 'Unusual Atmospheric Disturbance',
      severity: 'Critical',
      confidence: 0.92,
      location: 'Pacific Ocean',
      timestamp: '2 minutes ago',
      swarmConsensus: 0.89
    },
    {
      id: 'demo-002', 
      title: 'Seismic Activity Spike',
      severity: 'High',
      confidence: 0.78,
      location: 'Japan Trench',
      timestamp: '5 minutes ago',
      swarmConsensus: 0.85
    },
    {
      id: 'demo-003',
      title: 'Unidentified Aerial Phenomena',
      severity: 'Medium',
      confidence: 0.65,
      location: 'European Airspace',
      timestamp: '8 minutes ago',
      swarmConsensus: 0.72
    }
  ]);

  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  useEffect(() => {
    // Simulate real-time swarm activity updates
    const interval = setInterval(() => {
      setSwarmActivity(prev => ({
        ...prev,
        anomaliesProcessed: prev.anomaliesProcessed + Math.floor(Math.random() * 5) + 1,
        consensusRate: Math.min(99, prev.consensusRate + (Math.random() - 0.5) * 0.5),
        activeAgents: 150 + Math.floor(Math.random() * 20)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaia-dark via-blue-900 to-purple-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">
                  AGENT SWARM ACTIVE • {swarmActivity.activeAgents} AGENTS ONLINE
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  GAIA
                </span>
                <span className="ml-4 text-gray-400">3.1</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Planetary-scale autonomous anomaly detection powered by Gemini AI and agent swarm consensus. 
                Real-time threat identification, cross-modal verification, and predictive forecasting for global security.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button variant="primary" icon={Play} className="px-8 py-3 text-lg">
                  Enter Dashboard
                </Button>
              </Link>
              <Link to="/report">
                <Button variant="secondary" icon={AlertTriangle} className="px-8 py-3 text-lg">
                  Report Anomaly
                </Button>
              </Link>
            </div>
          </div>

          {/* Swarm Activity Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-blue-400">{swarmActivity.activeAgents}</div>
              <div className="text-sm text-gray-400 mt-1">Active Agents</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-green-400">{swarmActivity.consensusRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400 mt-1">Consensus Rate</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-purple-400">{swarmActivity.anomaliesProcessed.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Anomalies Processed</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-yellow-400">{swarmActivity.globalCoverage}%</div>
              <div className="text-sm text-gray-400 mt-1">Global Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Anomalies Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Recent Swarm Activity</h2>
            <p className="text-gray-400 text-lg">Real-time anomalies detected and verified by our agent swarm</p>
          </div>
          
          <div className="grid gap-6">
            {demoAnomalies.map((anomaly) => (
              <Card key={anomaly.id} className="hover:bg-white/5 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <Link to={`/incident/${anomaly.id}`} className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">
                        {anomaly.title}
                      </Link>
                      <SeverityBadge severity={anomaly.severity as any} />
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <span>📍 {anomaly.location}</span>
                      <span>🕒 {anomaly.timestamp}</span>
                      <span>🤖 Consensus: {(anomaly.swarmConsensus * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{(anomaly.confidence * 100).toFixed(0)}%</div>
                    <div className="text-xs text-gray-500">Confidence</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Swarm Intelligence Architecture</h2>
            <p className="text-gray-400 text-lg">Advanced AI agents working in consensus for unparalleled anomaly detection</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:bg-white/5 transition-all duration-300">
              <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Gemini AI Core</h3>
              <p className="text-gray-400">
                Multimodal analysis across text, images, video, and audio. Advanced pattern recognition and anomaly identification.
              </p>
            </Card>
            
            <Card className="text-center hover:bg-white/5 transition-all duration-300">
              <Network className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Agent Swarm</h3>
              <p className="text-gray-400">
                150+ specialized agents collaborating in real-time consensus. Cross-validation and conflict resolution.
              </p>
            </Card>
            
            <Card className="text-center hover:bg-white/5 transition-all duration-300">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Predictive Forecasting</h3>
              <p className="text-gray-400">
                Anticipate anomalies before they occur. Risk scoring and impact prediction across multiple scenarios.
              </p>
            </Card>
            
            <Card className="text-center hover:bg-white/5 transition-all duration-300">
              <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Autonomous Mitigation</h3>
              <p className="text-gray-400">
                AI-driven response planning and automated threat neutralization workflows.
              </p>
            </Card>
            
            <Card className="text-center hover:bg-white/5 transition-all duration-300">
              <Globe className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Global Coverage</h3>
              <p className="text-gray-400">
                24/7 monitoring across 190+ countries. Multi-language support and regional expertise.
              </p>
            </Card>
            
            <Card className="text-center hover:bg-white/5 transition-all duration-300">
              <Users className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Federated Intelligence</h3>
              <p className="text-gray-400">
                Secure knowledge sharing between agencies while maintaining data sovereignty.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Demo Preview */}
      <section className="py-20 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Experience the Swarm</h2>
          <p className="text-gray-400 text-lg mb-12">
            Witness real-time anomaly detection and agent consensus in action
          </p>
          
          <div className="relative">
            <div className="bg-black rounded-2xl p-8 border border-white/20">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className={`w-3 h-3 rounded-full ${isDemoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-gray-400">
                  {isDemoPlaying ? 'LIVE SWARM CONSENSUS' : 'DEMO READY'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">156</div>
                  <div className="text-sm text-gray-500">Text Analysis Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">89</div>
                  <div className="text-sm text-gray-500">Visual Analysis Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">47</div>
                  <div className="text-sm text-gray-500">Audio Analysis Agents</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Consensus Score</span>
                  <span className="text-white font-bold">94.7%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '94.7%' }}></div>
                </div>
              </div>
              
              <Button 
                variant="primary" 
                icon={isDemoPlaying ? Eye : Play}
                onClick={() => setIsDemoPlaying(!isDemoPlaying)}
                className="px-8 py-3"
              >
                {isDemoPlaying ? 'Stop Demo' : 'Start Live Demo'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Deploy Planetary Defense?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Join governments, research institutions, and security agencies worldwide 
            using GAIA 3.1 to protect our planet from emerging threats.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button variant="primary" icon={Play} className="px-10 py-4 text-lg">
                Launch Command Center
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="secondary" icon={AlertTriangle} className="px-10 py-4 text-lg">
                Report Threat
              </Button>
            </Link>
            <Button variant="secondary" icon={Download} className="px-10 py-4 text-lg">
              Download Technical Specs
            </Button>
          </div>
          
          <div className="mt-12 text-gray-500">
            <p>Trusted by 127 agencies worldwide • 99.9% uptime • SOC 2 compliant</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
