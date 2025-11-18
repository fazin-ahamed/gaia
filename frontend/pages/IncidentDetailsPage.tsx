
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import SeverityBadge from '../components/SeverityBadge';
import Button from '../components/Button';
import { mockAnomalies, mockWorkflow, mockAuditLogs } from '../data/mockData';
import { Clock, MapPin, Activity, FileText, Bot, User, Shield } from 'lucide-react';

const IncidentDetailsPage: React.FC = () => {
    const { id } = useParams();
    const anomaly = mockAnomalies.find(a => a.id === id) || mockAnomalies[0];

    return (
        <div className="p-8">
            <PageHeader title="Incident Details" subtitle={`A complete chronological record for anomaly: ${anomaly.id}`}>
                <Link to={`/audit/${anomaly.id}`}>
                    <Button variant="secondary" icon={FileText}>View Full Audit Log</Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h3 className="text-xl font-bold text-white mb-4">Anomaly Summary</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong className="text-gray-400 block">Title</strong>{anomaly.title}</div>
                            <div><strong className="text-gray-400 block">Status</strong><span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">{anomaly.status}</span></div>
                            <div><strong className="text-gray-400 block">Timestamp</strong>{new Date(anomaly.timestamp).toUTCString()}</div>
                            <div><strong className="text-gray-400 block">Location</strong>{anomaly.location.name}</div>
                            <div><strong className="text-gray-400 block">Source</strong>{anomaly.source}</div>
                            <div><strong className="text-gray-400 block">Modality</strong>{anomaly.modality}</div>
                        </div>
                        <div className="mt-4">
                            <strong className="text-gray-400 block">Description</strong>
                            <p>{anomaly.description}</p>
                        </div>
                    </Card>
                    <Card>
                         <h3 className="text-xl font-bold text-white mb-4">Incident Timeline</h3>
                         <div className="space-y-4">
                            {mockWorkflow.map(step => (
                                <div key={step.id} className="flex items-start space-x-3">
                                    <Clock className="w-4 h-4 text-gray-500 mt-1"/>
                                    <div>
                                        <p className="font-semibold text-white">{step.name} - <span className="font-normal text-gray-400">{step.status}</span></p>
                                        <p className="text-sm text-gray-500">{step.details}</p>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </Card>
                </div>
                <div className="space-y-8">
                    <Card>
                        <h3 className="text-xl font-bold text-white mb-4">AI Analysis</h3>
                         <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400">Severity</label>
                                <div className="mt-1"><SeverityBadge severity={anomaly.severity} /></div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-400">AI Reasoning</label>
                                <p className="text-sm text-gray-300 bg-gaia-dark p-3 rounded-md mt-1">{anomaly.aiReasoning}</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-xl font-bold text-white mb-4">Audit Log Preview</h3>
                        <div className="space-y-2 text-xs">
                        {mockAuditLogs.slice(0, 4).map(log => (
                            <p key={log.id} className="font-mono text-gray-400">
                                <span className="text-gray-500">{log.timestamp.split('T')[1].replace('Z','')}</span>
                                <span className={log.user.startsWith('System') ? 'text-blue-400' : 'text-yellow-400'}> {log.user}: </span>
                                {log.action}
                            </p>
                        ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default IncidentDetailsPage;
