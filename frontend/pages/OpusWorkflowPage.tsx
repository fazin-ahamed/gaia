
import React from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { mockWorkflow } from '../data/mockData';
import { WorkflowStep } from '../types';
import { CheckCircle, AlertCircle, Clock, Loader, ChevronsRight, Terminal, Database, Bot, User, Send } from 'lucide-react';

const statusIcons = {
  Completed: <CheckCircle className="text-green-500" />,
  'In Progress': <Loader className="text-blue-500 animate-spin" />,
  Error: <AlertCircle className="text-red-500" />,
  Pending: <Clock className="text-gray-500" />,
};

const nodeIcons = {
    'Intake': Database,
    'AI Detection (Gemini)': Bot,
    'Rule Engine': ChevronsRight,
    'Agentic Review': Bot,
    'Human Review': User,
    'Delivery': Send
}

const WorkflowNode: React.FC<{ step: WorkflowStep, isLast: boolean }> = ({ step, isLast }) => {
    const NodeIcon = nodeIcons[step.name];
    return (
        <div className="relative pl-8">
            {!isLast && <div className="absolute left-3.5 top-5 h-full w-0.5 bg-gaia-light"></div>}
            <div className="flex items-start space-x-4">
                <div className="bg-gaia-med border-2 border-gaia-light rounded-full p-2 z-10">
                    {NodeIcon && <NodeIcon className="w-5 h-5 text-gaia-accent" />}
                </div>
                <div className="flex-1 pb-8">
                    <div className="p-4 bg-gaia-dark rounded-lg border border-gaia-light">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-white">{step.name}</h3>
                            <div className="flex items-center space-x-2 text-sm">
                                {statusIcons[step.status]}
                                <span>{step.status}</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{step.details}</p>
                        <p className="text-xs text-gray-500 mt-2">{step.timestamp}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const OpusWorkflowPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="p-8">
      <PageHeader title="Opus Workflow Orchestration" subtitle={`Live job log for anomaly: ${id || 'ANOM-001'}`}>
        <div className="p-2 rounded-md bg-gaia-light flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-gray-300"/>
            <span className="text-sm font-mono text-gray-300">JOB_ID: {`wf-${id || 'ANOM-001'}`}</span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Processing Pipeline</h2>
                <div>
                    {mockWorkflow.map((step, index) => (
                        <WorkflowNode key={step.id} step={step} isLast={index === mockWorkflow.length - 1}/>
                    ))}
                </div>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Real-time Logs</h2>
                <div className="bg-black p-4 rounded-md h-96 overflow-y-auto font-mono text-xs">
                    <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">{mockWorkflow[0].timestamp}</span> - Workflow started for ANOM-001.</p>
                    <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">{mockWorkflow[1].timestamp}</span> - Gemini analysis complete. Result: Critical.</p>
                    <p><span className="text-green-400">[INFO]</span> <span className="text-gray-500">{mockWorkflow[2].timestamp}</span> - Rule engine triggered. Escalation protocol active.</p>
                    <p><span className="text-yellow-400">[WARN]</span> <span className="text-gray-500">{mockWorkflow[4].timestamp}</span> - Workflow paused. Awaiting human review.</p>
                    <p className="text-gray-400 animate-pulse">_</p>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default OpusWorkflowPage;
