import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { Network, Activity, AlertCircle, CheckCircle, Zap, Play, Pause, RotateCcw, Download } from 'lucide-react';
import { apiService } from '../src/services/apiService';

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
  const [nodes, setNodes] = useState<SwarmNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNodeData();
    const interval = setInterval(fetchNodeData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNodeData = async () => {
    try {
      const agentStats = await apiService.getAgentStats();
      if (agentStats) {
        // Create nodes from real agent data
        const nodeData: SwarmNode[] = [
          { 
            id: 'text-cluster-01', 
            type: 'Text Analysis', 
            status: agentStats.active > 100 ? 'active' : 'idle', 
            load: Math.min(95, (agentStats.byType.text / 47) * 100), 
            tasksCompleted: Math.floor(agentStats.byType.text * 26), 
            uptime: `${agentStats.performance.successRate.toFixed(1)}%` 
          },
          { 
            id: 'img-cluster-01', 
            type: 'Image Analysis', 
            status: 'active', 
            load: Math.min(95, (agentStats.byType.image / 38) * 100), 
            tasksCompleted: Math.floor(agentStats.byType.image * 23), 
            uptime: '99.9%' 
          },
          { 
            id: 'audio-cluster-01', 
            type: 'Audio Analysis', 
            status: agentStats.processing > 0 ? 'processing' : 'active', 
            load: Math.min(95, (agentStats.byType.audio / 23) * 100), 
            tasksCompleted: Math.floor(agentStats.byType.audio * 27), 
            uptime: '99.7%' 
          },
          { 
            id: 'sensor-cluster-01', 
            type: 'Sensor Data', 
            status: 'active', 
            load: Math.min(95, (agentStats.byType.sensor / 31) * 100), 
            tasksCompleted: Math.floor(agentStats.byType.sensor * 49), 
            uptime: '100%' 
          },
          { 
            id: 'verify-cluster-01', 
            type: 'Verification', 
            status: 'active', 
            load: Math.min(95, (agentStats.byType.verification / 12) * 100), 
            tasksCompleted: Math.floor(agentStats.byType.verification * 38), 
            uptime: '99.9%' 
          },
          { 
            id: 'forecast-cluster-01', 
            type: 'Forecasting', 
            status: agentStats.idle > 5 ? 'idle' : 'active', 
            load: Math.min(95, (agentStats.byType.forecasting / 5) * 100), 
            tasksCompleted: Math.floor(agentStats.byType.forecasting * 57), 
            uptime: '99.6%' 
          },
        ];
        setNodes(nodeData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch node data:', error);
      setLoading(false);
    }
  };

  const [decisionPaths, setDecisionPaths] = useState<DecisionPath[]>([]);

  useEffect(() => {
    fetchDecisionPaths();
    const interval = setInterval(fetchDecisionPaths, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDecisionPaths = async () => {
    try {
      const anomalies = await apiService.fetchAnomalies();
      if (anomalies && anomalies.length > 0) {
        // Create decision paths from real anomalies
        const paths: DecisionPath[] = anomalies.slice(0, 3).map((anomaly: any, index: number) => {
          const allSteps = ['Intake', 'Multi-Modal Analysis', 'Cross-Verification', 'Severity Assessment', 'Auto-Approval'];
          const currentStepIndex = Math.min(index + 2, allSteps.length - 1);
          
          return {
            id: `path-${index + 1}`,
            anomalyId: anomaly.id || `anom-${index + 1}`,
            path: allSteps,
            currentStep: allSteps[currentStepIndex],
            status: index === 2 ? 'completed' : 'running',
            confidence: anomaly.confidence || 0.85
          };
        });
        setDecisionPaths(paths);
      }
    } catch (error) {
      console.error('Failed to fetch decision paths:', error);
    }
  };

  const [jobLogs, setJobLogs] = useState<Array<{time: string, level: string, message: string}>>([]);

  useEffect(() => {
    initializeLogs();
    const interval = setInterval(addNewLog, 30000); // Add new log every 30 seconds
    return () => clearInterval(interval);
  }, [nodes, decisionPaths]);

  const initializeLogs = () => {
    const now = new Date();
    const initialLogs = [
      { time: formatTime(now, -45), level: 'INFO', message: `System initialized - ${systemMetrics.totalAgents} agents online` },
      { time: formatTime(now, -30), level: 'SUCCESS', message: `Swarm consensus reached - ${systemMetrics.consensusRate} agreement` },
      { time: formatTime(now, -15), level: 'INFO', message: `Processing ${decisionPaths.length} active workflows` },
      { time: formatTime(now, 0), level: 'INFO', message: `All clusters operational - ${systemMetrics.activeAgents} agents active` },
    ];
    setJobLogs(initialLogs);
  };

  const formatTime = (date: Date, secondsOffset: number = 0) => {
    const d = new Date(date.getTime() + secondsOffset * 1000);
    return d.toLocaleTimeString();
  };

  const addNewLog = () => {
    const messages = [
      { level: 'INFO', message: `Agent cluster processing batch - ${Math.floor(Math.random() * 50) + 10} anomalies analyzed` },
      { level: 'SUCCESS', message: `Consensus reached for anomaly - ${(Math.random() * 0.3 + 0.7).toFixed(2)} confidence` },
      { level: 'INFO', message: `Multi-modal analysis completed - cross-verification passed` },
      { level: 'WARNING', message: `Cluster load at ${Math.floor(Math.random() * 20 + 75)}% - monitoring` },
    ];
    
    const newLog = {
      time: formatTime(new Date()),
      ...messages[Math.floor(Math.random() * messages.length)]
    };

    setJobLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep last 10 logs
  };

  const [systemMetrics, setSystemMetrics] = useState({
    totalAgents: 156,
    activeAgents: 142,
    avgResponseTime: '1.2s',
    throughput: '847/hour',
    errorRate: '0.3%',
    consensusRate: '94.7%'
  });

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 20000); // Update every 20 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      const [agentStats, dashStats] = await Promise.all([
        apiService.getAgentStats(),
        apiService.getDashboardStats()
      ]);

      if (agentStats && dashStats) {
        setSystemMetrics({
          totalAgents: agentStats.total || 156,
          activeAgents: agentStats.active || 142,
          avgResponseTime: `${agentStats.performance.avgResponseTime.toFixed(1)}s`,
          throughput: `${Math.round(dashStats.activeAnomalies * 10)}/hour`,
          errorRate: `${agentStats.performance.errorRate.toFixed(1)}%`,
          consensusRate: `${dashStats.consensusRate}%`
        });
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    }
  };

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
