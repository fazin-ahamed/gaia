import React from 'react';
import { TrendingUp, AlertTriangle, Clock, Target } from 'lucide-react';

interface ForecastData {
  timeframe: string;
  probability: number;
  severity: string;
  impactAreas: string[];
}

interface PredictiveForecastingProps {
  anomalyId?: string;
}

const PredictiveForecasting: React.FC<PredictiveForecastingProps> = ({ anomalyId }) => {
  const forecasts: ForecastData[] = [
    {
      timeframe: '24 hours',
      probability: 0.78,
      severity: 'High',
      impactAreas: ['Infrastructure', 'Communications']
    },
    {
      timeframe: '72 hours',
      probability: 0.65,
      severity: 'Critical',
      impactAreas: ['Infrastructure', 'Communications', 'Transportation']
    },
    {
      timeframe: '7 days',
      probability: 0.52,
      severity: 'Medium',
      impactAreas: ['Economic', 'Social']
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gaia-card rounded-xl p-6 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-indigo-400" />
        <h3 className="text-xl font-semibold text-white">Predictive Forecasting</h3>
      </div>

      <div className="space-y-4">
        {forecasts.map((forecast, index) => (
          <div key={index} className="bg-black/30 rounded-lg p-4 hover:bg-black/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-white font-semibold">{forecast.timeframe}</span>
              </div>
              <span className={`text-sm font-semibold ${getSeverityColor(forecast.severity)}`}>
                {forecast.severity}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Probability</span>
                <span className="text-sm font-semibold text-white">{(forecast.probability * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${forecast.probability * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Impact Areas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {forecast.impactAreas.map((area, i) => (
                  <span key={i} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-yellow-400 mb-1">Forecast Alert</div>
            <div className="text-xs text-gray-400">
              High probability of escalation detected. Recommend immediate mitigation planning.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveForecasting;
