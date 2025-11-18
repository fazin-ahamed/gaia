import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Tooltip from '../components/Tooltip';
import SwarmVisualization from '../components/SwarmVisualization';
import { Upload, FileText, Image, Video, Mic, AlertTriangle, CheckCircle, Loader, Edit } from 'lucide-react';

const AnomalyUploadEnhanced: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'Medium',
    tags: [] as string[]
  });

  const [swarmAnalysis, setSwarmAnalysis] = useState({
    textAgents: { confidence: 0, output: '' },
    imageAgents: { confidence: 0, output: '' },
    audioAgents: { confidence: 0, output: '' },
    consensus: 0
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setProcessing(true);
      
      // Simulate swarm processing
      setTimeout(() => {
        setSwarmAnalysis({
          textAgents: { 
            confidence: 0.89, 
            output: 'Document contains anomalous patterns in communication protocols. Detected unusual terminology and encrypted segments.' 
          },
          imageAgents: { 
            confidence: 0.92, 
            output: 'Visual analysis reveals unidentified objects with non-standard characteristics. Thermal signatures indicate unusual energy emissions.' 
          },
          audioAgents: { 
            confidence: 0.78, 
            output: 'Audio spectrum analysis shows frequencies outside normal range. Possible electronic interference detected.' 
          },
          consensus: 0.86
        });
        
        setMetadata({
          title: 'Unidentified Aerial Phenomena - Multi-Modal Evidence',
          description: 'Multiple sensor modalities detected anomalous activity with high confidence. Cross-verification confirms unusual characteristics across visual, thermal, and electromagnetic spectra.',
          location: 'Pacific Northwest, USA',
          severity: 'High',
          tags: ['UAP', 'Multi-Modal', 'High-Confidence', 'Requires-Review']
        });
        
        setProcessing(false);
        setProcessed(true);
      }, 3000);
    }
  };

  const handleSubmit = () => {
    alert('Anomaly submitted to GAIA system for full swarm analysis and verification!');
  };

  return (
    <div className="min-h-screen bg-gaia-dark p-6">
      <PageHeader 
        title="Report Anomaly" 
        subtitle="Upload evidence for agent swarm analysis and verification"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">Upload Evidence</h2>
            
            {!uploadedFile ? (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-blue-400 transition-all cursor-pointer">
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.mp4,.mp3,.wav,.txt"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <div className="text-white font-semibold mb-2">Drop files here or click to upload</div>
                  <div className="text-sm text-gray-400 mb-4">
                    Supports: PDF, Images, Video, Audio, Text
                  </div>
                  <div className="flex justify-center space-x-4 text-gray-500">
                    <FileText className="w-6 h-6" />
                    <Image className="w-6 h-6" />
                    <Video className="w-6 h-6" />
                    <Mic className="w-6 h-6" />
                  </div>
                </label>
              </div>
            ) : (
              <div className="bg-black/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-400" />
                    <div>
                      <div className="text-white font-semibold">{uploadedFile.name}</div>
                      <div className="text-sm text-gray-400">{(uploadedFile.size / 1024).toFixed(2)} KB</div>
                    </div>
                  </div>
                  {processed && <CheckCircle className="w-6 h-6 text-green-400" />}
                  {processing && <Loader className="w-6 h-6 text-blue-400 animate-spin" />}
                </div>
                
                {processing && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Agent swarm processing...</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Safety Warning */}
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-yellow-400 mb-1">Security Notice</div>
                  <div className="text-xs text-gray-400">
                    All uploads are encrypted and processed in secure environments. Sensitive data is automatically redacted. 
                    Files are retained per agency policy and audit requirements.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Swarm Analysis Results */}
          {processed && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Swarm Analysis Results</h2>
                <div className="text-2xl font-bold text-purple-400">
                  {(swarmAnalysis.consensus * 100).toFixed(0)}% Consensus
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-semibold">Text Analysis Agents</span>
                    </div>
                    <span className="text-blue-400 font-semibold">
                      {(swarmAnalysis.textAgents.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{swarmAnalysis.textAgents.output}</p>
                </div>

                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Image className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-semibold">Image Analysis Agents</span>
                    </div>
                    <span className="text-purple-400 font-semibold">
                      {(swarmAnalysis.imageAgents.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{swarmAnalysis.imageAgents.output}</p>
                </div>

                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Mic className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold">Audio Analysis Agents</span>
                    </div>
                    <span className="text-green-400 font-semibold">
                      {(swarmAnalysis.audioAgents.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{swarmAnalysis.audioAgents.output}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Metadata Form */}
          {processed && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Anomaly Metadata</h2>
                <Button 
                  variant="secondary" 
                  icon={Edit}
                  onClick={() => setEditing(!editing)}
                  className="text-sm"
                >
                  {editing ? 'Save' : 'Edit'}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Title <Tooltip text="Brief descriptive title for the anomaly" />
                  </label>
                  <input 
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Description <Tooltip text="Detailed description of observed anomaly" />
                  </label>
                  <textarea 
                    value={metadata.description}
                    onChange={(e) => setMetadata({...metadata, description: e.target.value})}
                    disabled={!editing}
                    rows={4}
                    className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-white disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Location</label>
                    <input 
                      type="text"
                      value={metadata.location}
                      onChange={(e) => setMetadata({...metadata, location: e.target.value})}
                      disabled={!editing}
                      className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Severity</label>
                    <select 
                      value={metadata.severity}
                      onChange={(e) => setMetadata({...metadata, severity: e.target.value})}
                      disabled={!editing}
                      className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-white disabled:opacity-50"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag, i) => (
                      <span key={i} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Button variant="primary" onClick={handleSubmit} className="flex-1">
                  Submit for Full Analysis
                </Button>
                <Button variant="secondary" className="flex-1">
                  Save as Draft
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {processed && <SwarmVisualization />}
          
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Upload Guidelines</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>High-resolution images and videos preferred</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Include metadata: location, time, conditions</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Multiple modalities increase confidence</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Agent swarm processes in real-time</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Processing Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Avg Processing Time</span>
                <span className="text-white font-semibold">2.3s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Swarm Accuracy</span>
                <span className="text-white font-semibold">94.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Active Agents</span>
                <span className="text-white font-semibold">156</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnomalyUploadEnhanced;
