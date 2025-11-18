
import { Anomaly, WorkflowStep, AuditLog } from '../types';

export const mockAnomalies: Anomaly[] = [
  {
    id: 'ANOM-001',
    title: 'Unusual Seismic Activity - Sector 7G',
    description: 'Automated sensors detected seismic patterns inconsistent with known geological models. Potential precursor to tectonic shift.',
    timestamp: '2024-10-27T10:45:00Z',
    location: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, USA' },
    severity: 'Critical',
    confidence: 0.98,
    source: 'Seismic Sensor Array #42',
    modality: 'Sensor',
    status: 'Pending Review',
    aiReasoning: 'Gemini cross-referenced sensor data with satellite imagery, identifying micro-fractures on the surface. The combined probability model indicates a 98% chance of a significant event within 72 hours.',
    entities: ['Seismic Activity', 'Tectonic Shift', 'Micro-fractures'],
  },
  {
    id: 'ANOM-002',
    title: 'Anomalous Heat Signature - Amazon Basin',
    description: 'Satellite imagery shows a large, unexplained thermal anomaly in a protected rainforest region.',
    timestamp: '2024-10-27T09:30:00Z',
    location: { lat: -3.4653, lng: -62.2159, name: 'Amazon Rainforest' },
    severity: 'High',
    confidence: 0.91,
    source: 'ESA Sentinel-3 Satellite',
    modality: 'Image',
    dataUrl: 'https://picsum.photos/seed/amazonfire/800/600',
    status: 'Approved',
    aiReasoning: 'Image analysis indicates temperatures exceeding 800°C, consistent with illegal deforestation and burning activities. The pattern does not match natural wildfire spread.',
    entities: ['Thermal Anomaly', 'Deforestation', 'Illegal Burning'],
  },
  {
    id: 'ANOM-003',
    title: 'Irregular Financial Transactions',
    description: 'API feed from global financial markets shows a cluster of high-volume transactions with characteristics of market manipulation.',
    timestamp: '2024-10-27T08:15:00Z',
    location: { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
    severity: 'Medium',
    confidence: 0.85,
    source: 'Global Financial Market API',
    modality: 'API',
    status: 'Resolved',
    aiReasoning: 'The AI detected a high frequency of buy-sell orders for a low-cap stock originating from shell corporations, a classic pump-and-dump scheme. The transactions were flagged and reported.',
    entities: ['Market Manipulation', 'Shell Corporations', 'Pump-and-Dump'],
  },
  {
    id: 'ANOM-004',
    title: 'Unidentified Sub-aquatic Audio Signal',
    description: 'Hydrophone network picked up a repeating, low-frequency audio pattern not matching any known marine life or vessel signatures.',
    timestamp: '2024-10-26T23:50:00Z',
    location: { lat: 36.5780, lng: -147.9691, name: 'Mariana Trench' },
    severity: 'Low',
    confidence: 0.76,
    source: 'Pacific Hydrophone Array',
    modality: 'Audio',
    status: 'Approved',
    aiReasoning: 'The signal has a complex, structured pattern, ruling out most natural phenomena. While its origin is unknown, its low energy suggests it does not pose an immediate threat. Continued monitoring is advised.',
    entities: ['Audio Signal', 'Marine Life', 'Hydrophone'],
  }
];

export const mockWorkflow: WorkflowStep[] = [
    { id: 1, name: 'Intake', status: 'Completed', timestamp: '2024-10-27T10:45:01Z', details: 'Received seismic data from Sensor Array #42.' },
    { id: 2, name: 'AI Detection (Gemini)', status: 'Completed', timestamp: '2024-10-27T10:45:32Z', details: 'Multimodal analysis initiated. Severity: Critical, Confidence: 0.98.' },
    { id: 3, name: 'Rule Engine', status: 'Completed', timestamp: '2024-10-27T10:45:35Z', details: 'Matched rule "High-Impact Seismic Event". Triggered escalation protocol.' },
    { id: 4, name: 'Agentic Review', status: 'Completed', timestamp: '2024-10-27T10:46:01Z', details: 'Autonomous agent verified data consistency and checked for false positives. None found.' },
    { id: 5, name: 'Human Review', status: 'In Progress', timestamp: '2024-10-27T10:46:02Z', details: 'Anomaly flagged for mandatory human verification due to Critical severity.' },
    { id: 6, name: 'Delivery', status: 'Pending', timestamp: '', details: 'Awaiting human review outcome before dispatching alerts.' },
];

export const mockAuditLogs: AuditLog[] = [
    { id: 'LOG-001', timestamp: '2024-10-27T10:45:01Z', user: 'System', action: 'Intake', details: { source: 'Seismic Sensor Array #42', anomalyId: 'ANOM-001' } },
    { id: 'LOG-002', timestamp: '2024-10-27T10:45:32Z', user: 'System (Gemini)', action: 'AI Analysis', details: { result: 'Critical', confidence: 0.98 } },
    { id: 'LOG-003', timestamp: '2024-10-27T10:46:02Z', user: 'System', action: 'Flag for Human Review', details: { reason: 'Critical severity requires human sign-off.' } },
    { id: 'LOG-004', timestamp: '2024-10-27T11:05:15Z', user: 'Dr. Anya Sharma', action: 'Review Started', details: { anomalyId: 'ANOM-001' } },
];
