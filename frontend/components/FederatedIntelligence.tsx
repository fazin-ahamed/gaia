import React, { useState } from 'react';
import { Share2, Lock, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Button from './Button';

interface SharedIntelligence {
  id: string;
  agency: string;
  title: string;
  classification: string;
  sharedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const FederatedIntelligence: React.FC = () => {
  const [sharedIntel] = useState<SharedIntelligence[]>([
    {
      id: 'intel-001',
      agency: 'NOAA',
      title: 'Atmospheric Anomaly Pattern Analysis',
      classification: 'Confidential',
      sharedAt: '10 minutes ago',
      status: 'accepted'
    },
    {
      id: 'intel-002',
      agency: 'USGS',
      title: 'Seismic Activity Correlation Data',
      classification: 'Secret',
      sharedAt: '1 hour ago',
      status: 'pending'
    },
    {
      id: 'intel-003',
      agency: 'NASA',
      title: 'Satellite Imagery - Unusual Signatures',
      classification: 'Top Secret',
      sharedAt: '3 hours ago',
      status: 'accepted'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Top Secret': return 'text-red-400 bg-red-500/20';
      case 'Secret': return 'text-orange-400 bg-orange-500/20';
      case 'Confidential': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="bg-gaia-card rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Share2 className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Federated Intelligence</h3>
        </div>
        <Button variant="primary" icon={Share2} className="text-sm">
          Share Intel
        </Button>
      </div>

      <div className="space-y-3">
        {sharedIntel.map((intel) => (
          <div key={intel.id} className="bg-black/30 rounded-lg p-4 hover:bg-black/50 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-semibold">{intel.title}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-gray-400">From: {intel.agency}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getClassificationColor(intel.classification)}`}>
                    {intel.classification}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(intel.status)}
                <span className="text-xs text-gray-500">{intel.sharedAt}</span>
              </div>
            </div>
            {intel.status === 'pending' && (
              <div className="flex space-x-2 mt-3">
                <Button variant="primary" className="text-xs flex-1">Accept</Button>
                <Button variant="secondary" className="text-xs flex-1">Reject</Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-blue-400 mb-1">Secure Exchange</div>
            <div className="text-xs text-gray-400">
              All intelligence sharing is encrypted end-to-end. Data sovereignty maintained. Full audit trail recorded.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FederatedIntelligence;
