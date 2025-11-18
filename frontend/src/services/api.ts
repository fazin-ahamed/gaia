const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Anomalies
  async getAnomalies(params?: {
    page?: number;
    limit?: number;
    status?: string;
    severity?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request(`/anomalies?${queryString}`);
  }

  async getAnomaly(id: string) {
    return this.request(`/anomalies/${id}`);
  }

  async createAnomaly(anomaly: any) {
    return this.request('/anomalies', {
      method: 'POST',
      body: JSON.stringify(anomaly),
    });
  }

  async updateAnomaly(id: string, updates: any) {
    return this.request(`/anomalies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async approveAnomaly(id: string, reasoning?: string) {
    return this.request(`/anomalies/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reasoning }),
    });
  }

  async rejectAnomaly(id: string, reasoning?: string) {
    return this.request(`/anomalies/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reasoning }),
    });
  }

  async escalateAnomaly(id: string, reasoning?: string, priority?: string) {
    return this.request(`/anomalies/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reasoning, priority }),
    });
  }

  async getAnomalyReport(id: string, format: 'json' | 'pdf' = 'json') {
    const response = await fetch(`${API_BASE_URL}/anomalies/${id}/report/${format}`);
    if (format === 'pdf') {
      return response.blob();
    }
    return response.json();
  }

  async getAnomalyStats() {
    return this.request('/anomalies/stats/overview');
  }

  // Workflows
  async getWorkflows(params?: { status?: string; isTemplate?: boolean }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request(`/workflows?${queryString}`);
  }

  async getWorkflow(id: string) {
    return this.request(`/workflows/${id}`);
  }

  async createWorkflow(workflow: any) {
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async updateWorkflow(id: string, updates: any) {
    return this.request(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async executeWorkflow(id: string, parameters?: any) {
    return this.request(`/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ parameters }),
    });
  }

  async getWorkflowTemplates() {
    return this.request('/workflows/templates/list');
  }

  async createDefaultWorkflowTemplates() {
    return this.request('/workflows/templates/create-defaults', {
      method: 'POST',
    });
  }

  // API Management
  async collectData(location?: any, dataTypes?: string[]) {
    return this.request('/apis/collect', {
      method: 'POST',
      body: JSON.stringify({ location, dataTypes }),
    });
  }

  async getApiConfig() {
    return this.request('/apis/config');
  }

  async testApiConnection(apiName: string) {
    return this.request(`/apis/test/${apiName}`);
  }

  async updateApiKey(apiName: string, apiKey: string) {
    return this.request(`/apis/keys/${apiName}`, {
      method: 'PUT',
      body: JSON.stringify({ apiKey }),
    });
  }

  // System
  async getHealthStatus() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Settings
  async getSettings() {
    // In a real app, this would fetch from backend
    return {
      autonomousMode: false,
      notificationPreferences: {
        email: true,
        push: true,
        sms: false
      },
      apiKeys: {
        // Masked for security
        gemini: '••••••••••••••••',
        openweather: '••••••••••••••••'
      }
    };
  }

  async updateSettings(settings: any) {
    // In a real app, this would send to backend
    console.log('Settings updated:', settings);
    return { success: true };
  }
}

export const apiService = new ApiService();
export default apiService;