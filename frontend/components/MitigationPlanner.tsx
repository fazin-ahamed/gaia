import React, { useState } from 'react';
import { Shield, Play, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import Button from './Button';

interface MitigationStrategy {
  id: string;
  name: string;
  description: string;
  effectiveness: number;
  timeToImplement: string;
  resources: string[];
  risks: string[];
  status: 'recommended' | 'simulating' | 'approved' | 'rejected';
}

const MitigationPlanner: React.FC = () => {
  const [strategies, setStrategies] = useState<MitigationStrategy[]>([
    {
      id: 'strat-001',
      name: 'Immediate Containment Protocol',
      description: 'Deploy rapid response teams to affected areas with containment equipment',
      effectiveness: 0.87,
      timeToImplement: '2-4 hours',
      resources: ['Response Teams', 'Containment Equipment', 'Communication Systems'],
      risks: ['Resource allocation', 'Public awareness'],
      status: 'recommended'
    },
    {
      id: 'strat-002',
      name: 'Predictive Monitoring Enhancement',
      description: 'Increase sensor density and AI monitoring in high-risk zones',
      effectiveness: 0.92,
      timeToImplement: '6-12 hours',
      resources: ['Additional Sensors', 'AI Processing Power', 'Personnel'],
      risks: ['Cost overhead', 'False positive rate'],
      status: 'recommended'
    },
    {
      id: 'strat-003',
      name: 'Coordinated Agency Response',
      description: 'Activate multi-agency coordination protocol with federated intelligence sharing',
      effectiveness: 0.95,
      timeToImplement: '1-2 hours',
      resources: ['Agency Coordination', 'Secure Channels', 'Command Center'],
      risks: ['Information security', 'Coordination delays'],
      status: 'recommended'
    }
  ]);

  const [simulationRunning, setSimulationRunning] = useState(false);

  const runSimulation = (strategyId: string) => {
    setSimulationRunning(true);
    setStrategies(prev => prev.map(s => 
      s.id === strategyId ? { ...s, status: 'simulating' } : s
    ));

    setTimeout(() => {
      setStrategies(prev => prev.map(s => 
        s.id === strategyId ? { ...s, status: 'approved' } : s
      ));
      setSimulationRunning(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'simulating': return <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case 'rejected': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Shield className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-gaia-card rounded-xl p-6 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-green-400" />
        <h3 className="text-xl font-semibold text-white">Autonomous Mitigation Planner</h3>
      </div>

      <div className="space-y-4">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="bg-black/30 rounded-lg p-5 hover:bg-black/50 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                {getStatusIcon(strategy.status)}
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{strategy.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{strategy.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Effectiveness</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${strategy.effectiveness * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-white">{(strategy.effectiveness * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Time to Implement</div>
                <div className="text-sm font-semibold text-white">{strategy.timeToImplement}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Required Resources</div>
              <div className="flex flex-wrap gap-2">
                {strategy.resources.map((resource, i) => (
                  <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {resource}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Potential Risks</div>
              <div className="flex flex-wrap gap-2">
                {strategy.risks.map((risk, i) => (
                  <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                    {risk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="primary"
                icon={Play}
                onClick={() => runSimulation(strategy.id)}
                disabled={strategy.status === 'simulating' || strategy.status === 'approved'}
                className="text-sm"
              >
                {strategy.status === 'simulating' ? 'Simulating...' : 
                 strategy.status === 'approved' ? 'Approved' : 'Run Simulation'}
              </Button>
              {strategy.status === 'approved' && (
                <Button variant="secondary" className="text-sm">
                  Deploy Strategy
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MitigationPlanner;
