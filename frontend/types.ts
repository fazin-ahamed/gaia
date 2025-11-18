
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export type Modality = 'Text' | 'Image' | 'Audio' | 'Video' | 'API' | 'Sensor';

export type AnomalyStatus = 'Pending AI' | 'Pending Review' | 'Approved' | 'Resolved' | 'Escalated' | 'Overridden';

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  location: { lat: number; lng: number; name: string };
  severity: Severity;
  confidence: number;
  source: string;
  modality: Modality;
  dataUrl?: string;
  status: AnomalyStatus;
  aiReasoning: string;
  entities: string[];
  reviewerNotes?: string;
}

export interface WorkflowStep {
  id: number;
  name: 'Intake' | 'AI Detection (Gemini)' | 'Rule Engine' | 'Agentic Review' | 'Human Review' | 'Delivery';
  status: 'Completed' | 'In Progress' | 'Error' | 'Pending';
  timestamp: string;
  details: string;
  input?: any;
  output?: any;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    user: string; // 'System' or user name
    action: string;
    details: object;
}
