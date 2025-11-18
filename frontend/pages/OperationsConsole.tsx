import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { Network, Activity, AlertCircle, CheckCircle, Zap, Play, Pause, RotateCcw, Download } from 'lucide-react';

interface SwarmNode {
  id: string;
  type: string;
  status: 'active' | 'idle' | 'error' | 'processing';
  load: number;
  tasksCompleted: number;
  uptime: string;
}

interface DecisionPath {
  id: string;
  anomalyId: string;
  path: string[];
  currentStep: string;
  status: 'running' | 'completed' | 'paused' | 'error';
  confidence: number;
}

const OperationsConsole: React.FC = () => {
  const [nodes, setNodes] = useState<SwarmNode[]>([
    { id: 'text-cluster-01', type: 'Text Analysis', status: 'active', load: 78, tasksCompleted: 1247, uptime: '99.8%' },
    { id: 'img-cluster-01', type: 'Image Analysis', status: 'active', load: 82, tasksCompleted: 892, uptime: '99.9%' },
    { id: 'audio-cluster-01', type: 'Audio Analysis', status: 'processing', load: 91, tasksCompleted: 634, uptime: '99.7%' },
    { id: 'sensor-cluster-01', type: 'Sensor Data', status: 'active', load: 65, tasksCompleted: 1523, uptime: '100%' },
    { id: 'verify-cluster-01', type: 'Verification', status: 'active', load: 73, tasksCompleted: 456, uptime: '99.9%' },
    { id: 'forecast-cluster-01', type: 'Forecasting', status: 'idle', load: 23, tasksCompleted: 289, uptime: '99.6%' },
  ]);

  const [decisionPaths, setDecisionPaths] = useState<DecisionPath[]>([
    {
      id: 'path-001',
      anomalyId: 'anom-001',
      path: ['Intake', 'Text Analysis', 'Image Analysis', 'Cross-Verification', 'Severity Assessment', 'Human Review'],
      currentStep: 'Cross-Verification',
      status: 'running',
      confidence: 0.89
    },
    {
      id: 'path-002',
      anomalyId: 'anom-002',
      path: ['Intake', 'Sensor Analysis', 'Audio Analysis', 'Cross-Verification', 'Auto-Approval'],
      currentStep: 'Auto-Approval',
      status: 'running',
      confidence: 0.94
    },
    {
      id: 'path-003',
      anomalyId: 'anom-003',
      path: ['Intake', 'Multi-Modal Analysis', 'Forecasting', 'Escalation'],
      currentStep: 'Escalation',
      status: 'completed',
      confidence: 0.96
    }
  ]);

  const [jobLogs, setJobLogs] = useState([
    { time: '14:32:15', level: 'INFO', message: 'Text analysis cluster completed batch processing - 47 anomalies processed' },
    { time: '14:31:58', level: 'SUCCESS', message: 'Cross-verification consensus reached for anomaly anom-001 (89% confidence)' },
    { time: '14:31:42', level: 'WARNING', message: 'Audio analysis cluster load at 91% - scaling initiated' },
    { time: '14:31:20', level: 'INFO', message: 'New anomaly intake: anom-004 - Multi-modal analysis initiated' },
    { time: '14:30:55', level: 'ERROR', message: 'Forecasting agent forecast-agent-023 timeout - retrying with backup agent' },
    { time: '14:30:38', level: 'SUCCESS', message: 'Anomaly anom-003 escalated to human review - high severity confirmed' },
  ]);

  const [systemMetrics] = useState({
    totalAgents: 156,
    activeAgents: 142,
    avgResponseTime: '1.2s',
    throughput: '847/hour',
    errorRate: '0.3%',
    consensusRate: '94.7%'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        load: Math.max(20, Math.min(95, node.load + (Math.random() - 0.5) * 10)),
        status: node.load > 90 ? 'processing' : 'active'
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'idle': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Zap className="w-4 h-4 animate-pulse" />;
      case 'idle': return <Pause className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-400';
      case 'WARNING': return 'text-yellow-400';
      case 'SUCCESS': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gaia-dark p-6">
      <PageHeader 
        title="Operations Console" 
        subtitle="Real-time swarm coordination and system monitoring"
      />

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">{systemMetrics.totalAgents}</div>
          <div className="text-xs text-gray-400">Total Agents</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">{systemMetrics.activeAgents}</div>
          <div className="text-xs text-gray-400">Active Now</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">{systemMetrics.avgResponseTime}</div>
          <div className="text-xs text-gray-400">Avg Response</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">{systemMetrics.throughput}</div>
          <div className="text-xs text-gray-400">Throughput</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-400 mb-1">{systemMetrics.errorRate}</div>
          <div className="text-xs text-gray-400">Error Rate</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-indigo-400 mb-1">{systemMetrics.consensusRate}</div>
          <div className="text-xs text-gray-400">Consensus</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Swarm Coordination Diagram */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Network className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Swarm Node Status</h3>
            </div>
            <Button 
              variant="secondary" 
              icon={RotateCcw} 
              className="text-sm"
              onClick={() => {
                setNodes(prev => prev.map(node => ({
                  ...node,
                  load: Math.max(20, Math.min(95, node.load + (Math.random() - 0.5) * 10))
                })));
              }}
            >
              Refresh
            </Button>
          </div>

          <div className="space-y-3">
            {nodes.map((node) => (
              <div key={node.id} className="bg-black/30 rounded-lg p-4 hover:bg-black/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={getStatusColor(node.status)}>
                      {getStatusIcon(node.status)}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{node.type}</div>
                      <div className="text-xs text-gray-500">{node.id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${getStatusColor(node.status)}`}>
                      {node.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">{node.uptime} uptime</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Load</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${node.load > 85 ? 'bg-red-500' : node.load > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${node.load}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white font-semibold">{node.load}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Tasks Completed</div>
                    <div className="text-sm font-semibold text-white">{node.tasksCompleted.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Decision Paths */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Active Decision Paths</h3>
            </div>
          </div>

          <div className="space-y-4">
            {decisionPaths.map((path) => (
              <div key={path.id} className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold mb-1">Anomaly {path.anomalyId}</div>
                    <div className="text-xs text-gray-500">{path.id}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${path.status === 'running' ? 'text-blue-400' : path.status === 'completed' ? 'text-green-400' : 'text-gray-400'}`}>
                      {path.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">{(path.confidence * 100).toFixed(0)}% confidence</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {path.path.map((step, index) => (
                    <React.Fragment key={index}>
                      <div className={`flex-shrink-0 px-3 py-1 rounded text-xs font-semibold ${
                        step === path.currentStep 
                          ? 'bg-blue-500 text-white' 
                          : index < path.path.indexOf(path.currentStep)
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {step}
                      </div>
                      {index < path.path.length - 1 && (
                        <div className="text-gray-600">→</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-3 flex space-x-2">
                  {path.status === 'running' && (
                    <>
                      <Button 
                        variant="secondary" 
                        icon={Pause} 
                        className="text-xs flex-1"
                        onClick={() => {
                          setDecisionPaths(prev => prev.map(p => 
                            p.id === path.id ? { ...p, status: 'paused' as const } : p
                          ));
                        }}
                      >
                        Pause
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="text-xs flex-1"
                        onClick={() => {
                          if (confirm('Override this workflow decision path?')) {
                            setDecisionPaths(prev => prev.map(p => 
                              p.id === path.id ? { ...p, status: 'completed' as const } : p
                            ));
                          }
                        }}
                      >
                        Override
                      </Button>
                    </>
                  )}
                  {path.status === 'completed' && (
                    <Button 
                      variant="primary" 
                      icon={CheckCircle} 
                      className="text-xs flex-1"
                      onClick={() => alert(`Results for ${path.anomalyId}: Workflow completed successfully`)}
                    >
                      View Results
                    </Button>
                  )}
                  {path.status === 'paused' && (
                    <Button 
                      variant="primary" 
                      icon={Play} 
                      className="text-xs flex-1"
                      onClick={() => {
                        setDecisionPaths(prev => prev.map(p => 
                          p.id === path.id ? { ...p, status: 'running' as const } : p
                        ));
                      }}
                    >
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Job Logs */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold text-white">System Logs</h3>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              icon={Download} 
              className="text-sm"
              onClick={() => {
                const logsText = jobLogs.map(log => `[${log.time}] [${log.level}] ${log.message}`).join('\n');
                const blob = new Blob([logsText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `operations-logs-${new Date().toISOString()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export Logs
            </Button>
            <Button 
              variant="secondary" 
              icon={RotateCcw} 
              className="text-sm"
              onClick={() => {
                setJobLogs(prev => [
                  { time: new Date().toLocaleTimeString(), level: 'INFO', message: 'Logs refreshed manually' },
                  ...prev
                ]);
              }}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="bg-black rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
          {jobLogs.map((log, index) => (
            <div key={index} className="mb-2 hover:bg-white/5 p-2 rounded">
              <span className="text-gray-500">[{log.time}]</span>
              <span className={`ml-2 font-semibold ${getLogColor(log.level)}`}>[{log.level}]</span>
              <span className="ml-2 text-gray-300">{log.message}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default OperationsConsole;
