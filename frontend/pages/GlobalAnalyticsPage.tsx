import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import { SlidersHorizontal, Layers, Clock } from 'lucide-react';
import { Severity, Anomaly } from '../types';
import { mockAnomalies } from '../data/mockData';
import InteractiveMap from '../components/InteractiveMap';

const GlobalAnalyticsPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState(24); // in hours
    const [filters, setFilters] = useState<Severity[]>(['Critical', 'High', 'Medium', 'Low']);
    const [mapLayer, setMapLayer] = useState<'heatmap' | 'markers'>('heatmap');

    const toggleFilter = (severity: Severity) => {
        setFilters(prev =>
            prev.includes(severity)
                ? prev.filter(s => s !== severity)
                : [...prev, severity]
        );
    };

    const filteredAnomalies = useMemo(() => {
        const now = new Date();
        const timeLimit = new Date(now.getTime() - timeRange * 60 * 60 * 1000);

        return mockAnomalies.filter(anomaly => {
            const anomalyDate = new Date(anomaly.timestamp);
            const isWithinTime = anomalyDate >= timeLimit;
            const hasSeverity = filters.length > 0 ? filters.includes(anomaly.severity) : true;
            return isWithinTime && hasSeverity;
        });
    }, [timeRange, filters]);

    return (
        <div className="h-full flex flex-col">
            <div className="p-8 pb-0">
                <PageHeader title="Global Analytics" subtitle="Interactive map of real-time and historical anomaly data." />
            </div>
            <div className="flex-grow p-8 pt-0 relative">
                <div className="absolute top-0 left-8 bg-gaia-med/80 backdrop-blur-sm p-4 rounded-lg z-10 w-80">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center"><SlidersHorizontal className="w-5 h-5 mr-2" />Filters</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Severity</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {(['Critical', 'High', 'Medium', 'Low'] as Severity[]).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => toggleFilter(s)}
                                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${filters.includes(s) ? 'bg-gaia-accent text-white border-gaia-accent' : 'bg-transparent text-gray-300 border-gaia-light hover:bg-gaia-light'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="layer" className="text-sm font-medium text-gray-300 flex items-center"><Layers className="w-4 h-4 mr-2"/> Map Layer</label>
                            <select
                                id="layer"
                                className="mt-1 w-full bg-gaia-dark border border-gaia-light rounded-md px-2 py-1 text-sm focus:ring-gaia-accent focus:border-gaia-accent"
                                value={mapLayer}
                                onChange={(e) => setMapLayer(e.target.value as 'heatmap' | 'markers')}
                            >
                                <option value="heatmap">Heatmap</option>
                                <option value="markers">Markers</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gaia-med/80 backdrop-blur-sm p-4 rounded-lg z-10 w-1/2">
                    <label htmlFor="time-slider" className="text-sm font-medium text-gray-300 flex items-center mb-2"><Clock className="w-4 h-4 mr-2"/> Time Range: Last {timeRange} hours</label>
                    <input
                        id="time-slider"
                        type="range"
                        min="1"
                        max={30 * 24} // 30 days
                        value={timeRange}
                        onChange={(e) => setTimeRange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gaia-dark rounded-lg appearance-none cursor-pointer"
                    />
                     <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1h</span>
                        <span>24h</span>
                        <span>7d</span>
                        <span>30d</span>
                    </div>
                </div>

                <div className="w-full h-full bg-gaia-dark rounded-lg overflow-hidden">
                   <InteractiveMap anomalies={filteredAnomalies} layerType={mapLayer} />
                </div>
            </div>
        </div>
    );
};

export default GlobalAnalyticsPage;