import React from 'react';
import { Anomaly } from '../types';
import Tooltip from './Tooltip';
import WorldMapBackground from './WorldMapBackground';

interface InteractiveMapProps {
  anomalies: Anomaly[];
  layerType?: 'heatmap' | 'markers';
  onAnomalyClick?: (anomaly: Anomaly) => void;
}

const severityColors = {
  Critical: 'rgba(229, 62, 62, 0.7)', // red
  High: 'rgba(221, 107, 32, 0.7)', // orange
  Medium: 'rgba(214, 158, 46, 0.7)', // yellow
  Low: 'rgba(49, 130, 206, 0.7)', // blue
};

// A simplified projection to convert lat/lng to x/y percentages.
// This is not geographically accurate but serves for visualization.
const projectToPercent = (lat: number, lng: number) => {
    // Basic Equirectangular projection
    const x = (lng + 180) / 360 * 100;
    const y = (90 - lat) / 180 * 100;
    return { x, y };
};


const InteractiveMap: React.FC<InteractiveMapProps> = ({ anomalies, layerType = 'markers', onAnomalyClick }) => {
  const renderHeatmap = () => {
    return anomalies.map((anomaly) => {
      const { x, y } = projectToPercent(anomaly.location.lat, anomaly.location.lng);
      const intensity = {
          Critical: 1.0,
          High: 0.8,
          Medium: 0.6,
          Low: 0.4
      }[anomaly.severity];

      return (
        <div
          key={anomaly.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            width: `15vw`,
            height: `15vw`,
            maxWidth: `${intensity * 200}px`,
            maxHeight: `${intensity * 200}px`,
            background: `radial-gradient(circle, ${severityColors[anomaly.severity]} 0%, rgba(255, 255, 255, 0) 70%)`,
            opacity: 0.5,
          }}
        />
      );
    });
  };

  const renderMarkers = () => {
    return anomalies.map((anomaly) => {
      const { x, y } = projectToPercent(anomaly.location.lat, anomaly.location.lng);
      const color = severityColors[anomaly.severity].replace('0.7', '1');

      return (
        <Tooltip key={anomaly.id} text={`${anomaly.title} (${anomaly.severity})`}>
          <div
            className="absolute rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: '12px',
              height: '12px',
              backgroundColor: color,
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: `0 0 10px ${color}`,
            }}
            onClick={() => onAnomalyClick?.(anomaly)}
          />
        </Tooltip>
      );
    });
  };

  return (
    <div className="relative w-full h-full bg-gaia-dark overflow-hidden">
        <WorldMapBackground />
        
        <div className="absolute inset-0 w-full h-full bg-black/30"></div>

        <div className="absolute inset-0" style={{ mixBlendMode: layerType === 'heatmap' ? 'screen' : 'normal' }}>
            {layerType === 'heatmap' ? renderHeatmap() : renderMarkers()}
        </div>
        
        {anomalies.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 p-4 rounded-md">
                  <p className="text-lg text-gray-500">No anomalies found for the selected filters.</p>
                </div>
            </div>
        )}
    </div>
  );
};

export default InteractiveMap;
