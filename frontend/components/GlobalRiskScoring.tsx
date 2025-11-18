import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { apiService } from '../src/services/apiService';

interface RiskMetric {
  region: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  activeThreats: number;
  change: number;
}

const GlobalRiskScoring: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([
    { region: 'North America', score: 67, trend: 'down', activeThreats: 12, change: -3 },
    { region: 'Europe', score: 54, trend: 'stable', activeThreats: 8, change: 0 },
    { region: 'Asia Pacific', score: 78, trend: 'up', activeThreats: 23, change: 5 },
    { region: 'Middle East', score: 82, trend: 'up', activeThreats: 31, change: 8 },
    { region: 'Africa', score: 61, trend: 'down', activeThreats: 15, change: -2 },
    { region: 'South America', score: 49, trend: 'stable', activeThreats: 7, change: 0 },
  ]);

  useEffect(() => {
    fetchRiskData();
    const interval = setInterval(fetchRiskData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchRiskData = async () => {
    try {
      const hotspots = await apiService.fetchHotspots();
      if (hotspots && hotspots.length > 0) {
        // Calculate risk scores from real hotspot data
        const regionMap: { [key: string]: { score: number; count: number } } = {};
        
        hotspots.forEach((hotspot: any) => {
          const region = getRegionFromCity(hotspot.name);
          if (!regionMap[region]) {
            regionMap[region] = { score: 0, count: 0 };
          }
          
          // Calculate risk score based on consensus and severity
          const riskScore = hotspot.analysis.consensus * 100;
          regionMap[region].score += riskScore;
          regionMap[region].count += 1;
        });

        // Update risk metrics
        const updatedMetrics = Object.keys(regionMap).map(region => {
          const avgScore = Math.round(regionMap[region].score / regionMap[region].count);
          const oldMetric = riskMetrics.find(m => m.region === region);
          const change = oldMetric ? avgScore - oldMetric.score : 0;
          
          return {
            region,
            score: avgScore,
            trend: change > 2 ? 'up' as const : change < -2 ? 'down' as const : 'stable' as const,
            activeThreats: regionMap[region].count,
            change
          };
        });

        if (updatedMetrics.length > 0) {
          setRiskMetrics(updatedMetrics);
        }
      }
    } catch (error) {
      console.error('Failed to fetch risk data:', error);
    }
  };

  const getRegionFromCity = (city: string): string => {
    const regionMap: { [key: string]: string } = {
      'New York': 'North America',
      'London': 'Europe',
      'Tokyo': 'Asia Pacific',
      'Sydney': 'Asia Pacific',
      'Mumbai': 'Asia Pacific',
      'São Paulo': 'South America'
    };
    return regionMap[city] || 'Other';
  };

  const globalRiskScore = Math.round(riskMetrics.reduce((acc, m) => acc + m.score, 0) / riskMetrics.length);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-red-600';
    if (score >= 60) return 'from-orange-500 to-orange-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gaia-card rounded-xl p-6 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-orange-400" />
        <h3 className="text-xl font-semibold text-white">Global Risk Scoring</h3>
      </div>

      {/* Global Score */}
      <div className="bg-black/30 rounded-lg p-6 mb-6 text-center">
        <div className="text-sm text-gray-400 mb-2">Global Risk Index</div>
        <div className={`text-5xl font-bold mb-3 ${getRiskColor(globalRiskScore)}`}>
          {globalRiskScore}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className={`bg-gradient-to-r ${getRiskBgColor(globalRiskScore)} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${globalRiskScore}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-2">Updated in real-time</div>
      </div>

      {/* Regional Breakdown */}
      <div className="space-y-3">
        {riskMetrics.map((metric) => (
          <div key={metric.region} className="bg-black/30 rounded-lg p-4 hover:bg-black/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{metric.region}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-400">{metric.activeThreats} threats</span>
                <span className={`text-lg font-bold ${getRiskColor(metric.score)}`}>
                  {metric.score}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${getRiskBgColor(metric.score)} h-2 rounded-full`}
                  style={{ width: `${metric.score}%` }}
                ></div>
              </div>
              <span className={`text-xs font-semibold ${metric.change > 0 ? 'text-red-400' : metric.change < 0 ? 'text-green-400' : 'text-gray-400'}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Categories */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">2</div>
          <div className="text-xs text-gray-400">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">4</div>
          <div className="text-xs text-gray-400">High</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">8</div>
          <div className="text-xs text-gray-400">Medium</div>
        </div>
      </div>
    </div>
  );
};

export default GlobalRiskScoring;
