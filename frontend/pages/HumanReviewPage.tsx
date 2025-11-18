
import React from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import SeverityBadge from '../components/SeverityBadge';
import Button from '../components/Button';
import { mockAnomalies } from '../data/mockData';
import { Check, X, ArrowUpRight, MessageSquare, Info } from 'lucide-react';

const HumanReviewPage: React.FC = () => {
  const { id } = useParams();
  const anomaly = mockAnomalies.find(a => a.id === id) || mockAnomalies[0];

  return (
    <div className="p-8">
      <PageHeader title="Human Review Console" subtitle={`Reviewing anomaly flagged by AI: ${anomaly.id}`} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <Card>
                <h3 className="text-lg font-bold text-white mb-4">Evidence Viewer</h3>
                {anomaly.modality === 'Image' && anomaly.dataUrl && (
                    <img src={anomaly.dataUrl} alt="Anomaly evidence" className="rounded-lg w-full object-cover" />
                )}
                {anomaly.modality !== 'Image' && (
                    <div className="bg-gaia-dark p-4 rounded-md">
                        <h4 className="font-semibold">{anomaly.title}</h4>
                        <p className="text-sm text-gray-400 mt-2">{anomaly.description}</p>
                    </div>
                )}
            </Card>
        </div>

        <div className="lg:col-span-2">
            <div className="sticky top-8">
                <Card>
                    <h3 className="text-xl font-bold text-white mb-4">AI Recommendation</h3>
                    <div className="p-4 bg-gaia-dark rounded-md border border-gaia-accent">
                        <p className="text-sm text-gray-300">"Based on multimodal analysis, I recommend immediate escalation. The combination of seismic data and surface-level micro-fractures presents a critical and time-sensitive risk."</p>
                        <p className="text-xs text-right text-gaia-accent mt-2">- Gemini</p>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-400">AI Assessed Severity</label>
                            <div className="mt-1"><SeverityBadge severity={anomaly.severity} /></div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">AI Confidence Score</label>
                            <p className="text-2xl font-bold text-white mt-1">{(anomaly.confidence * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                    
                    <div className="mt-6 border-t border-gaia-light pt-6">
                        <h4 className="text-lg font-semibold text-white mb-3">Reviewer Actions</h4>
                        <div className="mb-4">
                            <label htmlFor="reviewer-notes" className="block text-sm font-medium text-gray-300 mb-1">Reviewer Notes</label>
                            <textarea id="reviewer-notes" rows={3} className="w-full bg-gaia-dark border border-gaia-light rounded-md p-2 focus:ring-gaia-accent focus:border-gaia-accent" placeholder="Provide justification for your decision. This is a mandatory field for the audit log."></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="primary" icon={Check}>Approve AI Finding</Button>
                            <Button variant="danger" icon={X}>Override & Dismiss</Button>
                            <Button variant="secondary" icon={ArrowUpRight}>Escalate Manually</Button>
                            <Button variant="secondary" icon={Info}>Request More Info</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HumanReviewPage;
