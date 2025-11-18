const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export interface WeatherData {
  openWeather: any;
  weatherBit: any;
  noaa: any;
  timestamp: string;
}

export interface AirQualityData {
  openAQ: any;
  aqicn: any;
  timestamp: string;
}

export interface AgentAnalysis {
  type: string;
  agentId: string;
  confidence: number;
  output: string;
  timestamp: string;
}

export interface SwarmAnalysis {
  agents: AgentAnalysis[];
  consensus: number;
  timestamp: string;
}

export interface Hotspot {
  name: string;
  lat: number;
  lon: number;
  data: any;
  analysis: SwarmAnalysis;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/realtime/weather?lat=${lat}&lon=${lon}`
      );
      if (!response.ok) throw new Error('Weather fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Weather API error:', error);
      return null;
    }
  }

  async fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | null> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/realtime/air-quality?lat=${lat}&lon=${lon}`
      );
      if (!response.ok) throw new Error('Air quality fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Air quality API error:', error);
      return null;
    }
  }

  async fetchNews(query: string = 'anomaly'): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/realtime/news?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('News fetch failed');
      return await response.json();
    } catch (error) {
      console.error('News API error:', error);
      return [];
    }
  }

  async fetchEvents(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/realtime/events`);
      if (!response.ok) throw new Error('Events fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Events API error:', error);
      return [];
    }
  }

  async aggregateData(lat: number, lon: number, query?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/realtime/aggregate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, query })
      });
      if (!response.ok) throw new Error('Aggregation failed');
      return await response.json();
    } catch (error) {
      console.error('Aggregation API error:', error);
      return null;
    }
  }

  async analyzeWithSwarm(data: any): Promise<SwarmAnalysis> {
    try {
      const response = await fetch(`${this.baseURL}/api/realtime/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      if (!response.ok) throw new Error('Analysis failed');
      return await response.json();
    } catch (error) {
      console.error('Swarm analysis API error:', error);
      return { agents: [], consensus: 0, timestamp: new Date().toISOString() };
    }
  }

  async fetchHotspots(): Promise<Hotspot[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/realtime/hotspots`);
      if (!response.ok) throw new Error('Hotspots fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Hotspots API error:', error);
      return [];
    }
  }

  async fetchAnomalies(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/anomalies`);
      if (!response.ok) throw new Error('Anomalies fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Anomalies API error:', error);
      return [];
    }
  }

  async createAnomaly(anomalyData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/anomalies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anomalyData)
      });
      if (!response.ok) throw new Error('Anomaly creation failed');
      return await response.json();
    } catch (error) {
      console.error('Create anomaly API error:', error);
      return null;
    }
  }

  async uploadAndAnalyze(file: File, metadata?: any): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata?.description) formData.append('description', metadata.description);
      if (metadata?.location) formData.append('location', metadata.location);

      const response = await fetch(`${this.baseURL}/api/upload/analyze`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return await response.json();
    } catch (error) {
      console.error('Upload API error:', error);
      return null;
    }
  }

  async uploadMultipleAndAnalyze(files: File[], metadata?: any): Promise<any> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      if (metadata?.description) formData.append('description', metadata.description);
      if (metadata?.location) formData.append('location', metadata.location);

      const response = await fetch(`${this.baseURL}/api/upload/analyze-multiple`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Multiple upload failed');
      return await response.json();
    } catch (error) {
      console.error('Multiple upload API error:', error);
      return null;
    }
  }

  async analyzeText(text: string, metadata?: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/upload/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, ...metadata })
      });
      
      if (!response.ok) throw new Error('Text analysis failed');
      return await response.json();
    } catch (error) {
      console.error('Text analysis API error:', error);
      return null;
    }
  }

  async getDashboardStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/stats/dashboard`);
      if (!response.ok) throw new Error('Stats fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Stats API error:', error);
      return null;
    }
  }

  async getAgentStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/stats/agents`);
      if (!response.ok) throw new Error('Agent stats fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Agent stats API error:', error);
      return null;
    }
  }

  async getAlertStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/stats/alerts`);
      if (!response.ok) throw new Error('Alert stats fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Alert stats API error:', error);
      return null;
    }
  }
}

export const apiService = new APIService();
export default apiService;
