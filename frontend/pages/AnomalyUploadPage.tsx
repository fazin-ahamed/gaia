import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Mic, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Brain, 
  Users, 
  Shield,
  Eye,
  Play,
  Download,
  X
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useWebSocket } from '../src/hooks/useWebSocket';

interface UploadFile {
  id: string;
  file: File;
  type: 'text' | 'image' | 'audio' | 'video' | 'pdf';
  status: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'error';
  progress: number;
  preview?: string;
  metadata?: {
    title?: string;
    description?: string;
    location?: string;
    timestamp?: string;
    tags?: string[];
  };
}

interface SwarmAgent {
  id: string;
  name: string;
  specialty: 'Text Analysis' | 'Image/Video Analysis' | 'Audio Analysis' | 'Sensor Data' | 'Cross-Modality Verification' | 'Forecasting';
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  confidence: number;
  consensusWeight: number;
}

interface ProcessingResult {
  swarmConsensus: number;
  anomalyDetected: boolean;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  reasoning: string;
  recommendations: string[];
  agents: SwarmAgent[];
}

const AnomalyUploadPage: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<ProcessingResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ws = useWebSocket('ws://localhost:3001');

  const allowedTypes = {
    text: ['.txt', '.doc', '.docx'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
    audio: ['.mp3', '.wav', '.m4a', '.flac'],
    video: ['.mp4', '.avi', '.mov', '.wmv', '.flv'],
    pdf: ['.pdf']
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: getFileType(file),
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    uploadFiles(newFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFiles: UploadFile[] = Array.from(droppedFiles).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: getFileType(file),
        status: 'uploading',
        progress: 0
      }));

      setFiles(prev => [...prev, ...newFiles]);
      uploadFiles(newFiles);
    }
  };

  const getFileType = (file: File): UploadFile['type'] => {
    const name = file.name.toLowerCase();
    if (name.match(/\.(txt|doc|docx)$/)) return 'text';
    if (name.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)) return 'image';
    if (name.match(/\.(mp3|wav|m4a|flac)$/)) return 'audio';
    if (name.match(/\.(mp4|avi|mov|wmv|flv)$/)) return 'video';
    if (name.match(/\.pdf$/)) return 'pdf';
    return 'text';
  };

  const uploadFiles = async (uploadFiles: UploadFile[]) => {
    for (const uploadFile of uploadFiles) {
      // Simulate file upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress } : f
        ));
        
        if (progress >= 100) {
          clearInterval(interval);
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, status: 'uploaded' } : f
          ));
        }
      }, 200);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const startSwarmAnalysis = async () => {
    if (!consentGiven) {
      alert('Please provide consent before proceeding with analysis.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate swarm analysis
    const mockAgents: SwarmAgent[] = [
      { id: 'text-001', name: 'Text Analysis Agent', specialty: 'Text Analysis', status: 'analyzing', confidence: 0, consensusWeight: 0.15 },
      { id: 'image-001', name: 'Image Analysis Agent', specialty: 'Image/Video Analysis', status: 'analyzing', confidence: 0, consensusWeight: 0.25 },
      { id: 'audio-001', name: 'Audio Analysis Agent', specialty: 'Audio Analysis', status: 'analyzing', confidence: 0, consensusWeight: 0.20 },
      { id: 'sensor-001', name: 'Sensor Fusion Agent', specialty: 'Sensor Data', status: 'analyzing', confidence: 0, consensusWeight: 0.15 },
      { id: 'verification-001', name: 'Cross-Modality Agent', specialty: 'Cross-Modality Verification', status: 'analyzing', confidence: 0, consensusWeight: 0.20 },
      { id: 'forecast-001', name: 'Forecasting Agent', specialty: 'Forecasting', status: 'analyzing', confidence: 0, consensusWeight: 0.05 }
    ];

    // Simulate agent processing with different speeds
    const results: ProcessingResult = {
      swarmConsensus: 0,
      anomalyDetected: false,
      severity: 'Low',
      confidence: 0,
      reasoning: '',
      recommendations: [],
      agents: mockAgents
    };

    setProcessingResults(results);

    // Simulate agent analysis progression
    const agentIntervals = mockAgents.map((agent, index) => {
      return setInterval(() => {
        setProcessingResults(prev => {
          if (!prev) return null;
          
          const updatedAgents = prev.agents.map(a => 
            a.id === agent.id 
              ? { ...a, confidence: Math.random() * 0.3 + 0.7, status: 'completed' as const }
              : a
          );
          
          const completedAgents = updatedAgents.filter(a => a.status === 'completed');
          const consensus = completedAgents.reduce((sum, agent) => sum + (agent.confidence * agent.consensusWeight), 0);
          
          return {
            ...prev,
            swarmConsensus: consensus,
            confidence: consensus,
            agents: updatedAgents
          };
        });
      }, 1500 + index * 800);
    });

    // Final result after all agents complete
    setTimeout(() => {
      setProcessingResults(prev => {
        if (!prev) return null;
        
        const finalConsensus = prev.agents.reduce((sum, agent) => 
          sum + (agent.confidence * agent.consensusWeight), 0
        );
        
        return {
          ...prev,
          swarmConsensus: finalConsensus,
          confidence: finalConsensus,
          anomalyDetected: finalConsensus > 0.7,
          severity: finalConsensus > 0.9 ? 'Critical' : finalConsensus > 0.8 ? 'High' : finalConsensus > 0.7 ? 'Medium' : 'Low',
          reasoning: finalConsensus > 0.7 
            ? "Multiple agents detected anomalous patterns across different modalities. Cross-modality verification confirms unusual activity warranting investigation."
            : "Analysis complete - no significant anomalies detected. All patterns appear within normal parameters.",
          recommendations: finalConsensus > 0.7 
            ? [
                "Initiate Level 2 security protocol",
                "Deploy additional sensor analysis",
                "Notify regional command centers",
                "Prepare mitigation response team"
              ]
            : ["Continue routine monitoring", "No immediate action required"]
        };
      });
      
      setIsProcessing(false);
      agentIntervals.forEach(interval => clearInterval(interval));
    }, 8000);
  };

  const getAgentIcon = (specialty: SwarmAgent['specialty']) => {
    switch (specialty) {
      case 'Text Analysis': return FileText;
      case 'Image/Video Analysis': return Image;
      case 'Audio Analysis': return Mic;
      case 'Sensor Data': return Users;
      case 'Cross-Modality Verification': return Brain;
      case 'Forecasting': return Eye;
      default: return Brain;
    }
  };

  const getStatusColor = (status: SwarmAgent['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'analyzing': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Anomaly Intelligence Upload</h1>
              <p className="text-gray-400 mt-1">
                Upload files for autonomous analysis by our agent swarm. Supports text, images, audio, video, and PDF documents.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="secondary" onClick={() => setFiles([])}>
                Clear All
              </Button>
              <Button 
                variant="primary" 
                onClick={startSwarmAnalysis}
                disabled={files.length === 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Start Swarm Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card className="border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Intelligence</h2>
              
              {/* Upload Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-400/10' 
                    : 'border-white/30 hover:border-white/50 hover:bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Drag and drop files here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    browse
                  </button>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={Object.values(allowedTypes).flat().join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">
                  Supports: Images, Videos, Audio, Documents, PDFs
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-3">Uploaded Files ({files.length})</h3>
                  <div className="space-y-3">
                    {files.map((file) => {
                      const IconComponent = file.type === 'image' ? Image : 
                                           file.type === 'video' ? Video : 
                                           file.type === 'audio' ? Mic : 
                                           file.type === 'pdf' ? FileText : FileText;
                      
                      return (
                        <div key={file.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-6 h-6 text-blue-400" />
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm truncate max-w-xs">{file.file.name}</p>
                              <p className="text-gray-400 text-xs">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.status === 'uploading' && (
                              <div className="w-16 bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${file.progress}%` }}
                                ></div>
                              </div>
                            )}
                            {file.status === 'uploaded' && (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            )}
                            {file.status === 'processing' && (
                              <Clock className="w-5 h-5 text-yellow-400 animate-spin" />
                            )}
                            <button
                              onClick={() => removeFile(file.id)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Safety Warnings */}
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-400 mb-1">Safety & Privacy Notice</h4>
                    <p className="text-gray-300 text-sm">
                      All uploaded content is analyzed using autonomous AI agents. Ensure you have proper authorization 
                      for any sensitive or classified materials. Analysis results may be shared with authorized agencies 
                      through our federated intelligence network.
                    </p>
                  </div>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="mt-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-white font-medium">I understand and consent to AI analysis</span>
                    <p className="text-gray-400 text-sm">
                      By checking this box, you acknowledge that uploaded content will be analyzed by autonomous AI agents 
                      and may be processed through our federated intelligence network.
                    </p>
                  </div>
                </label>
              </div>
            </Card>
          </div>

          {/* Processing Results */}
          <div className="lg:col-span-2">
            {processingResults ? (
              <div className="space-y-6">
                {/* Swarm Analysis Results */}
                <Card className="border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Swarm Analysis Results</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">Swarm Consensus:</span>
                      <span className="text-2xl font-bold text-blue-400">
                        {(processingResults.swarmConsensus * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <Shield className={`w-6 h-6 ${
                          processingResults.anomalyDetected ? 'text-red-400' : 'text-green-400'
                        }`} />
                        <div>
                          <div className="text-white font-semibold">
                            {processingResults.anomalyDetected ? 'Anomaly Detected' : 'No Anomaly'}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Confidence: {(processingResults.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      {processingResults.anomalyDetected && (
                        <div className="mt-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            processingResults.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                            processingResults.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                            processingResults.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {processingResults.severity} Severity
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-white font-medium mb-2">Recommendations</h3>
                      <ul className="space-y-1">
                        {processingResults.recommendations.map((rec, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                            <span className="text-blue-400 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-white font-medium mb-2">Agent Reasoning</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {processingResults.reasoning}
                    </p>
                  </div>
                </Card>

                {/* Agent Activity */}
                <Card className="border border-white/20">
                  <h2 className="text-xl font-semibold text-white mb-4">Agent Swarm Activity</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {processingResults.agents.map((agent) => {
                      const IconComponent = getAgentIcon(agent.specialty);
                      return (
                        <div key={agent.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-6 h-6 text-blue-400" />
                            <div>
                              <div className="text-white font-medium text-sm">{agent.name}</div>
                              <div className="text-gray-400 text-xs">{agent.specialty}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${getStatusColor(agent.status)}`}>
                              {agent.status === 'completed' && '✅ Complete'}
                              {agent.status === 'analyzing' && '🔄 Analyzing'}
                              {agent.status === 'error' && '❌ Error'}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              {(agent.confidence * 100).toFixed(0)}% confidence
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Actions */}
                <Card className="border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Next Steps</h2>
                      <p className="text-gray-400">Choose your preferred action</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                      <Button variant="primary">
                        <Play className="w-4 h-4 mr-2" />
                        Continue to Verification
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="border border-white/20">
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-500 mx-auto mb-6 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">Ready for Analysis</h3>
                  <p className="text-gray-400 mb-6">
                    Upload files above to begin autonomous analysis by our agent swarm.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Features:</p>
                    <ul className="list-disc list-inside text-left mt-2 space-y-1">
                      <li>Multi-modal AI analysis (text, image, audio, video)</li>
                      <li>Cross-modality verification and consensus building</li>
                      <li>Real-time processing with 94%+ accuracy</li>
                      <li>Federated intelligence sharing (optional)</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyUploadPage;