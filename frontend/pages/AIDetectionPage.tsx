
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import SeverityBadge from '../components/SeverityBadge';
import Button from '../components/Button';
import { mockAnomalies } from '../data/mockData';
import { CheckCircle, Edit, PlayCircle } from 'lucide-react';

const AIDetectionPage: React.FC = () => {
  const { id } = useParams();
  const anomaly = mockAnomalies.find(a => a.id === id) || mockAnomalies[0];

  return (
    <div className="p-8">
      <PageHeader title="AI Detection Analysis" subtitle={`Viewing Gemini output for anomaly: ${anomaly.id}`} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Evidence Source</h3>
            {anomaly.modality === 'Image' && anomaly.dataUrl && (
              <img src={anomaly.dataUrl} alt="Anomaly evidence" className="rounded-lg w-full object-cover" />
            )}
            {anomaly.modality !== 'Image' && (
               <div className="bg-gaia-dark p-4 rounded-md">
                   <pre className="text-sm text-gray-300 whitespace-pre-wrap">{JSON.stringify({
                        source: anomaly.source,
                        type: anomaly.modality,
                        description: anomaly.description
                   }, null, 2)}</pre>
               </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Gemini Analysis</h3>
            <div className="space-y-6">
                <div>
                    <label className="text-sm font-medium text-gray-400">Assessed Severity</label>
                    <div className="mt-1">
                        <SeverityBadge severity={anomaly.severity} />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-400">Confidence Score</label>
                    <div className="w-full bg-gaia-dark rounded-full h-2.5 mt-1">
                        <div className="bg-gaia-accent h-2.5 rounded-full" style={{ width: `${anomaly.confidence * 100}%` }}></div>
                    </div>
                    <p className="text-right text-sm font-bold text-gaia-accent mt-1">{(anomaly.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-400">AI Reasoning Summary</label>
                    <p className="text-sm text-gray-300 bg-gaia-dark p-3 rounded-md mt-1">{anomaly.aiReasoning}</p>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-400">Extracted Entities</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {anomaly.entities.map(entity => (
                            <span key={entity} className="px-2 py-1 bg-gaia-light text-xs text-gaia-text rounded-md">{entity}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-8 border-t border-gaia-light pt-6">
                 <h4 className="text-lg font-semibold text-white mb-3">Next Steps</h4>
                 <p className="text-sm text-gray-400 mb-4">The system recommends flagging this for human review due to high severity. You can approve this recommendation or force the workflow to continue autonomously.</p>
                <div className="flex space-x-4">
                    <Link to={`/review/${anomaly.id}`}>
                        <Button variant="primary" icon={CheckCircle}>Approve & Proceed to Review</Button>
                    </Link>
                    <Link to={`/workflow/${anomaly.id}`}>
                        <Button variant="secondary" icon={PlayCircle}>Continue Autonomously</Button>
                    </Link>
                </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIDetectionPage;
