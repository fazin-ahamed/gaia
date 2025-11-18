import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { apiService, Hotspot } from '../src/services/apiService';

interface InteractiveMapEnhancedProps {
  onHotspotClick?: (hotspot: Hotspot) => void;
}

const InteractiveMapEnhanced: React.FC<InteractiveMapEnhancedProps> = ({ onHotspotClick }) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  useEffect(() => {
    fetchHotspots();
    const interval = setInterval(fetchHotspots, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchHotspots = async () => {
    try {
      setLoading(true);
      const data = await apiService.fetchHotspots();
      setHotspots(data);
    } catch (error) {
      console.error('Failed to fetch hotspots:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#EF4444';
      case 'High': return '#F59E0B';
      case 'Medium': return '#FBBF24';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    if (onHotspotClick) {
      onHotspotClick(hotspot);
    }
  };

  // Simple world map SVG background
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg overflow-hidden">
      {/* World Map Background */}
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full opacity-20"
        style={{ filter: 'blur(1px)' }}
      >
        <path
          d="M 0 250 Q 250 200 500 250 T 1000 250"
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 0 300 Q 250 280 500 300 T 1000 300"
          stroke="#3B82F6"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M 0 200 Q 250 180 500 200 T 1000 200"
          stroke="#3B82F6"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">Loading real-time data...</div>
        </div>
      )}

      {/* Hotspots */}
      <div className="absolute inset-0">
        {hotspots.map((hotspot, index) => {
          // Convert lat/lon to screen coordinates (simplified projection)
          const x = ((hotspot.lon + 180) / 360) * 100;
          const y = ((90 - hotspot.lat) / 180) * 100;

          return (
            <div
              key={index}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => handleHotspotClick(hotspot)}
            >
              {/* Pulsing Circle */}
              <div
                className="w-4 h-4 rounded-full animate-pulse"
                style={{
                  backgroundColor: getSeverityColor(hotspot.severity),
                  boxShadow: `0 0 20px ${getSeverityColor(hotspot.severity)}`
                }}
              />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
                  <div className="font-semibold">{hotspot.name}</div>
                  <div className="text-gray-400">
                    Severity: {hotspot.severity}
                  </div>
                  <div className="text-gray-400">
                    Consensus: {(hotspot.analysis.consensus * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Hotspot Details */}
      {selectedHotspot && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/90 rounded-lg p-4 text-white">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{selectedHotspot.name}</span>
              </h3>
              <div className="text-sm text-gray-400">
                {selectedHotspot.lat.toFixed(4)}, {selectedHotspot.lon.toFixed(4)}
              </div>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs text-gray-400">Severity</div>
              <div className="text-sm font-semibold" style={{ color: getSeverityColor(selectedHotspot.severity) }}>
                {selectedHotspot.severity}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Swarm Consensus</div>
              <div className="text-sm font-semibold">
                {(selectedHotspot.analysis.consensus * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {selectedHotspot.analysis.agents.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Active Agents</div>
              <div className="flex flex-wrap gap-1">
                {selectedHotspot.analysis.agents.map((agent, i) => (
                  <span
                    key={i}
                    className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded"
                  >
                    {agent.type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-3 text-white text-xs">
        <div className="font-semibold mb-2">Severity</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
            <span>Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
            <span>High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FBBF24' }} />
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
            <span>Low</span>
          </div>
        </div>
      </div>

      {/* Real-time Indicator */}
      <div className="absolute top-4 left-4 bg-black/80 rounded-lg px-3 py-2 text-white text-xs flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span>LIVE DATA</span>
      </div>
    </div>
  );
};

export default InteractiveMapEnhanced;
