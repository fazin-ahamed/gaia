
import React from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { HelpCircle } from 'lucide-react';

const OnboardingStep: React.FC<{ number: number, title: string, children: React.ReactNode }> = ({ number, title, children }) => (
    <Card className="flex items-start space-x-6">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gaia-accent text-white text-2xl font-bold rounded-full">
            {number}
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <div className="text-gray-400 space-y-2">
                {children}
            </div>
        </div>
    </Card>
);

const OnboardingPage: React.FC = () => {
    return (
        <div className="p-8">
            <PageHeader title="Welcome to GAIA" subtitle="A quick guide to get you started with the platform." />

            <div className="max-w-4xl mx-auto space-y-8">
                <OnboardingStep number={1} title="The Dashboard: Your Global Command Center">
                    <p>The <strong>Dashboard</strong> is your main view. Here you'll find the <strong>Live Anomalies Feed</strong>, a real-time list of all detected events. Use the filters to sort by severity.</p>
                    <p className="p-2 bg-gaia-dark rounded-md text-sm">
                        <strong className="text-gray-300">Tooltip:</strong> The <strong>Global Hotspots</strong> map gives you a quick visual of where anomalies are concentrated.
                    </p>
                </OnboardingStep>

                <OnboardingStep number={2} title="Reporting an Anomaly">
                    <p>Have your own data? Use the <strong>Report Anomaly</strong> page to submit it. You can paste text, upload files (images, audio, etc.), or point GAIA to an API endpoint.</p>
                     <p className="p-2 bg-gaia-dark rounded-md text-sm">
                        <strong className="text-gray-300">Tooltip:</strong> Metadata like timestamp and location are often auto-detected to speed up the process.
                    </p>
                </OnboardingStep>

                <OnboardingStep number={3} title="Understanding the Workflow: Autonomous vs. Human Review">
                    <p>GAIA is designed to be fully autonomous. After data is ingested, our AI (Gemini) analyzes it and an orchestration engine (Opus) processes it.</p>
                    <ul className="list-disc list-inside pl-4">
                        <li><strong>Fully Autonomous Mode:</strong> The system handles everything from detection to resolution without intervention.</li>
                        <li><strong>Human Review Mode:</strong> For high-severity events, the workflow pauses and flags the anomaly in the <strong>Review Pending</strong> queue. A human must approve or override the AI's findings before the workflow continues.</li>
                    </ul>
                </OnboardingStep>
                
                 <OnboardingStep number={4} title="Ensuring Accountability">
                    <p>Every action is tracked. The <strong>Incident Details</strong> page provides a full timeline, while the <strong>Audit Viewer</strong> gives you a raw, downloadable log for complete transparency.</p>
                </OnboardingStep>
            </div>
        </div>
    );
};

export default OnboardingPage;
