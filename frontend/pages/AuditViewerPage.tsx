
import React from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { mockAuditLogs } from '../data/mockData';
import { Download, FileJson, FileText } from 'lucide-react';

const AuditViewerPage: React.FC = () => {
    const { id } = useParams();

    return (
        <div className="p-8">
            <PageHeader title="Audit Log Viewer" subtitle={`Detailed, immutable record for anomaly: ${id || 'ANOM-001'}`}>
                <Button variant="primary" icon={Download}>Download Report (PDF)</Button>
                <Button variant="secondary" icon={FileJson}>Export as JSON</Button>
            </PageHeader>

            <Card>
                <div className="bg-black p-4 rounded-md font-mono text-sm text-gray-300 h-[70vh] overflow-y-auto">
                    <pre>{JSON.stringify({
                        anomalyId: id || 'ANOM-001',
                        reportGenerated: new Date().toISOString(),
                        logs: mockAuditLogs,
                    }, null, 2)}</pre>
                </div>
            </Card>
        </div>
    );
};

export default AuditViewerPage;
