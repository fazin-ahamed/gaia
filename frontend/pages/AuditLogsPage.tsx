import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, Calendar, User, Activity, Download, Eye } from 'lucide-react';

interface AuditLog {
  id: string;
  anomalyId: string;
  action: string;
  actor: string;
  timestamp: string;
  changes?: any;
  reasoning?: string;
  confidence?: number;
}

const AuditLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterActor, setFilterActor] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      // Fetch all anomalies and their audit logs
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/anomalies?limit=100`);
      
      if (!response.ok) {
        console.error('Failed to fetch audit logs:', response.status);
        setLogs([]);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      const allLogs: AuditLog[] = [];
      
      if (data.anomalies) {
        data.anomalies.forEach((anomaly: any) => {
          // Create logs from anomaly data
          allLogs.push({
            id: `log-${anomaly.id}-created`,
            anomalyId: anomaly.id,
            action: 'ANOMALY_CREATED',
            actor: anomaly.source || 'system',
            timestamp: anomaly.createdAt,
            changes: { status: 'created' },
            reasoning: `Anomaly ${anomaly.id} created`,
            confidence: anomaly.confidence
          });

          if (anomaly.status === 'verified') {
            allLogs.push({
              id: `log-${anomaly.id}-verified`,
              anomalyId: anomaly.id,
              action: 'ANOMALY_VERIFIED',
              actor: 'human-reviewer',
              timestamp: anomaly.updatedAt || anomaly.createdAt,
              changes: { status: 'verified' },
              reasoning: 'Anomaly verified by human reviewer'
            });
          }

          if (anomaly.status === 'rejected') {
            allLogs.push({
              id: `log-${anomaly.id}-rejected`,
              anomalyId: anomaly.id,
              action: 'ANOMALY_REJECTED',
              actor: 'human-reviewer',
              timestamp: anomaly.updatedAt || anomaly.createdAt,
              changes: { status: 'rejected' },
              reasoning: 'Anomaly rejected after review'
            });
          }

          if (anomaly.aiAnalysis) {
            allLogs.push({
              id: `log-${anomaly.id}-analyzed`,
              anomalyId: anomaly.id,
              action: 'AI_ANALYSIS_COMPLETED',
              actor: 'gemini-ai',
              timestamp: anomaly.createdAt,
              changes: { aiAnalysis: 'completed' },
              reasoning: 'AI analysis completed',
              confidence: anomaly.aiAnalysis.consensus
            });
          }
        });
      }

      // Sort by timestamp descending
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setLogs(allLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ANOMALY_CREATED': return 'text-blue-400';
      case 'ANOMALY_VERIFIED': return 'text-green-400';
      case 'ANOMALY_REJECTED': return 'text-red-400';
      case 'AI_ANALYSIS_COMPLETED': return 'text-purple-400';
      case 'WORKFLOW_EXECUTED': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ANOMALY_CREATED': return '🆕';
      case 'ANOMALY_VERIFIED': return '✅';
      case 'ANOMALY_REJECTED': return '❌';
      case 'AI_ANALYSIS_COMPLETED': return '🤖';
      case 'WORKFLOW_EXECUTED': return '⚙️';
      default: return '📝';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.anomalyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesActor = filterActor === 'all' || log.actor === filterActor;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dateRange === 'today') matchesDate = daysDiff < 1;
      else if (dateRange === 'week') matchesDate = daysDiff < 7;
      else if (dateRange === 'month') matchesDate = daysDiff < 30;
    }
    
    return matchesSearch && matchesAction && matchesActor && matchesDate;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueActors = [...new Set(logs.map(l => l.actor))];

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString()}.json`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-500" />
            Audit Logs
          </h1>
          <p className="text-gray-400 mt-1">Complete audit trail of all system activities</p>
        </div>
        <button
          onClick={exportLogs}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Logs</p>
              <p className="text-2xl font-bold text-white">{logs.length}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Today</p>
              <p className="text-2xl font-bold text-white">
                {logs.filter(l => {
                  const diff = (new Date().getTime() - new Date(l.timestamp).getTime()) / (1000 * 60 * 60 * 24);
                  return diff < 1;
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unique Actors</p>
              <p className="text-2xl font-bold text-white">{uniqueActors.length}</p>
            </div>
            <User className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Action Types</p>
              <p className="text-2xl font-bold text-white">{uniqueActions.length}</p>
            </div>
            <Filter className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={filterActor}
            onChange={(e) => setFilterActor(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Actors</option>
            {uniqueActors.map(actor => (
              <option key={actor} value={actor}>{actor}</option>
            ))}
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Anomaly ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reasoning</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                    Loading audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{getActionIcon(log.action)}</span>
                        <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                      {log.anomalyId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {log.actor}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-md truncate">
                      {log.reasoning || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.confidence ? `${(log.confidence * 100).toFixed(0)}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/incident/${log.anomalyId}`)}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>Showing {filteredLogs.length} of {logs.length} audit logs</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default AuditLogsPage;
