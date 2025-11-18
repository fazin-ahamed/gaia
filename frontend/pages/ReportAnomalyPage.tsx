
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Tooltip from '../components/Tooltip';
import { UploadCloud, Type, Link, File, Clock, MapPin, AlertCircle, Trash2, Send } from 'lucide-react';

const ReportAnomalyPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'text' | 'file' | 'api'>('text');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size must not exceed 10MB.');
                setFile(null);
            } else {
                setError('');
                setFile(selectedFile);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setSuccess('Anomaly reported successfully. GAIA is now analyzing the data.');
            setFile(null);
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };
    
    const renderFormContent = () => {
        switch(activeTab) {
            case 'text':
                return (
                    <div>
                        <label htmlFor="text-input" className="block text-sm font-medium text-gray-300 mb-1">Anomaly Description</label>
                        <textarea id="text-input" rows={8} className="w-full bg-gaia-dark border border-gaia-light rounded-md p-2 focus:ring-gaia-accent focus:border-gaia-accent" placeholder="Provide a detailed description of the anomaly. Include observations, context, and any relevant data points."></textarea>
                    </div>
                );
            case 'file':
                return (
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload Evidence</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gaia-light border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gaia-dark rounded-md font-medium text-gaia-accent hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gaia-med focus-within:ring-gaia-accent">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">Image, PDF, Audio, Video up to 10MB</p>
                            </div>
                        </div>
                        {file && (
                            <div className="mt-4 p-2 bg-gaia-dark rounded-md flex justify-between items-center">
                                <p className="text-sm text-gray-300">Selected: {file.name}</p>
                                <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'api':
                return (
                    <div>
                        <label htmlFor="api-endpoint" className="block text-sm font-medium text-gray-300 mb-1">API Endpoint</label>
                        <input type="url" id="api-endpoint" className="w-full bg-gaia-dark border border-gaia-light rounded-md p-2 focus:ring-gaia-accent focus:border-gaia-accent" placeholder="https://api.example.com/data-feed" />
                        <p className="text-xs text-gray-500 mt-1">GAIA will trigger a fetch from this endpoint.</p>
                    </div>
                );
        }
    }

    return (
        <div className="p-8">
            <PageHeader title="Report New Anomaly" subtitle="Submit data for autonomous analysis by the GAIA platform." />
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <div className="border-b border-gaia-light mb-4">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button type="button" onClick={() => setActiveTab('text')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'text' ? 'border-gaia-accent text-gaia-accent' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}><Type className="inline-block mr-2 w-4 h-4"/>Text Input</button>
                                <button type="button" onClick={() => setActiveTab('file')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'file' ? 'border-gaia-accent text-gaia-accent' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}><File className="inline-block mr-2 w-4 h-4"/>File Upload</button>
                                <button type="button" onClick={() => setActiveTab('api')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'api' ? 'border-gaia-accent text-gaia-accent' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}><Link className="inline-block mr-2 w-4 h-4"/>API Fetch</button>
                            </nav>
                        </div>
                        {renderFormContent()}
                    </Card>
                </div>
                <div>
                    <Card>
                        <h3 className="text-lg font-bold text-white mb-4">Metadata</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <div>
                                    <p className="font-semibold text-gray-300">Timestamp</p>
                                    <p className="text-gray-400">{new Date().toISOString()} (Auto-filled)</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                <div>
                                    <p className="font-semibold text-gray-300">Geolocation</p>
                                    <p className="text-gray-400">48.8584° N, 2.2945° E (Auto-detected)</p>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Additional Notes</label>
                                <textarea id="notes" rows={4} className="w-full bg-gaia-dark border border-gaia-light rounded-md p-2 focus:ring-gaia-accent focus:border-gaia-accent" placeholder="Add any supplementary context or instructions for the AI."></textarea>
                            </div>
                        </div>
                    </Card>
                     <div className="mt-6 flex space-x-4">
                        <Button type="submit" variant="primary" icon={Send} disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit for Analysis'}</Button>
                        <Button type="reset" variant="secondary" icon={Trash2} disabled={isLoading}>Reset</Button>
                    </div>
                    {error && <p className="mt-4 text-sm text-red-500 flex items-center"><AlertCircle className="w-4 h-4 mr-2"/>{error}</p>}
                    {success && <p className="mt-4 text-sm text-green-400">{success}</p>}
                </div>
            </form>
        </div>
    );
};

export default ReportAnomalyPage;
