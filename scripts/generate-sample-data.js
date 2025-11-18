const fs = require('fs');
const path = require('path');

// Sample anomaly data for demonstration
const sampleAnomalies = [
  {
    id: "sample-anomaly-001",
    title: "Severe Weather Anomaly - Hurricane Formation",
    description: "Unusual rapid intensification of tropical depression into major hurricane category within 24 hours, accompanied by satellite imagery showing irregular cloud patterns.",
    severity: "critical",
    confidence: 0.92,
    status: "approved",
    location: {
      lat: 25.7617,
      lng: -80.1918,
      address: "Miami, Florida, USA",
      region: "Atlantic Ocean"
    },
    modalities: {
      text: "Tropical Depression 19 has rapidly intensified into Hurricane Zeta with winds of 140 mph. Satellite imagery shows unusual eye wall structure and rapid intensification rate not typical for this time of season.",
      images: [
        {
          url: "https://example.com/satellite-image-001.jpg",
          description: "Satellite image showing hurricane eye wall",
          timestamp: "2025-11-18T06:00:00Z"
        }
      ],
      videos: [],
      audio: []
    },
    aiAnalysis: {
      isAnomaly: true,
      severity: "critical",
      confidence: 0.92,
      description: "Extremely rapid hurricane intensification detected. Confidence based on cross-verification between NOAA satellite data, weather radar, and historical patterns.",
      crossVerification: {
        sources: ["NOAA Satellite", "Weather Radar", "Ocean Buoy Data"],
        confidence: 0.89,
        verificationStatus: "confirmed"
      },
      recommendedActions: [
        "Issue immediate hurricane warning",
        "Activate emergency response teams",
        "Monitor for landfall trajectory",
        "Prepare evacuation orders"
      ]
    },
    crossVerification: {
      sources: ["NOAA Satellite", "Weather Radar", "Ocean Buoy Data"],
      confidence: 0.89,
      verificationStatus: "confirmed"
    },
    timestamp: "2025-11-18T05:30:00Z",
    lastUpdated: "2025-11-18T07:00:00Z",
    sourceApis: ["NOAA Satellite", "Weather Underground", "USGS"],
    tags: ["weather", "hurricane", "critical", "emergency"]
  },
  {
    id: "sample-anomaly-002",
    title: "Earthquake Swarm Detection",
    description: "Unusual cluster of 15+ earthquakes in California fault zone within 2-hour window, magnitudes ranging from 2.1 to 4.8.",
    severity: "high",
    confidence: 0.87,
    status: "processing",
    location: {
      lat: 35.7796,
      lng: -119.4179,
      address: "Central California, USA",
      region: "San Andreas Fault Zone"
    },
    modalities: {
      text: "Earthquake swarm detected: 15 earthquakes in 2 hours, largest M4.8. Seismic activity concentrated in 5km radius. Unusual for this region.",
      images: [
        {
          url: "https://example.com/seismic-map-001.jpg",
          description: "Seismic activity map showing earthquake cluster",
          timestamp: "2025-11-18T04:30:00Z"
        }
      ],
      videos: [],
      audio: []
    },
    aiAnalysis: {
      isAnomaly: true,
      severity: "high",
      confidence: 0.87,
      description: "Earthquake swarm pattern detected with unusual concentration and frequency. May indicate impending larger event.",
      crossVerification: {
        sources: ["USGS Earthquake API", "Seismic Network", "GPS Displacement Data"],
        confidence: 0.84,
        verificationStatus: "confirmed"
      },
      recommendedActions: [
        "Increase seismic monitoring",
        "Issue public advisory",
        "Prepare emergency response teams",
        "Monitor for larger aftershock"
      ]
    },
    crossVerification: {
      sources: ["USGS Earthquake API", "Seismic Network", "GPS Displacement Data"],
      confidence: 0.84,
      verificationStatus: "confirmed"
    },
    timestamp: "2025-11-18T04:00:00Z",
    lastUpdated: "2025-11-18T06:30:00Z",
    sourceApis: ["USGS", "California Seismic Network"],
    tags: ["earthquake", "seismic", "swarm", "high-risk"]
  },
  {
    id: "sample-anomaly-003",
    title: "Air Quality Crisis - Industrial Pollution Spike",
    description: "Dramatic increase in PM2.5 levels (400+ µg/m³) detected across multiple monitoring stations in industrial zone, 5x normal levels.",
    severity: "high",
    confidence: 0.83,
    status: "reviewed",
    location: {
      lat: 22.3193,
      lng: 114.1694,
      address: "Hong Kong Industrial District",
      region: "Pearl River Delta"
    },
    modalities: {
      text: "Critical air quality deterioration: PM2.5 levels surged to 450 µg/m³ across 12 monitoring stations. Wind patterns suggest industrial source.",
      images: [
        {
          url: "https://example.com/air-quality-map-001.jpg",
          description: "Air quality heatmap showing pollution concentration",
          timestamp: "2025-11-18T02:00:00Z"
        }
      ],
      videos: [
        {
          url: "https://example.com/drone-footage-001.mp4",
          description: "Drone footage showing industrial emissions",
          timestamp: "2025-11-18T02:30:00Z"
        }
      ],
      audio: []
    },
    aiAnalysis: {
      isAnomaly: true,
      severity: "high",
      confidence: 0.83,
      description: "Severe air quality degradation detected with multiple corroborating data sources indicating industrial pollution event.",
      crossVerification: {
        sources: ["AirVisual API", "Government Monitoring", "Satellite Imagery", "Weather Data"],
        confidence: 0.81,
        verificationStatus: "confirmed"
      },
      recommendedActions: [
        "Issue public health warning",
        "Investigate industrial sources",
        "Activate air filtration systems",
        "Monitor population health indicators"
      ]
    },
    crossVerification: {
      sources: ["AirVisual API", "Government Monitoring", "Satellite Imagery", "Weather Data"],
      confidence: 0.81,
      verificationStatus: "confirmed"
    },
    timestamp: "2025-11-18T01:45:00Z",
    lastUpdated: "2025-11-18T05:15:00Z",
    sourceApis: ["AirVisual", "EPA Monitoring Network", "NOAA Satellite"],
    tags: ["air-quality", "pollution", "industrial", "health-risk"]
  },
  {
    id: "sample-anomaly-004",
    title: "Traffic Congestion Anomaly - Mass Evacuation Pattern",
    description: "Unusual outbound traffic pattern detected on all major highways from metropolitan area, 300% increase in traffic volume with emergency vehicle activity.",
    severity: "medium",
    confidence: 0.76,
    status: "approved",
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: "New York City, USA",
      region: "Northeast Corridor"
    },
    modalities: {
      text: "Mass evacuation pattern detected: All major highways showing 300% traffic increase outbound. Emergency vehicle activity elevated. Possible incident response.",
      images: [
        {
          url: "https://example.com/traffic-map-001.jpg",
          description: "Traffic congestion map showing evacuation patterns",
          timestamp: "2025-11-18T03:00:00Z"
        }
      ],
      videos: [],
      audio: []
    },
    aiAnalysis: {
      isAnomaly: true,
      severity: "medium",
      confidence: 0.76,
      description: "Mass evacuation traffic pattern detected with emergency vehicle correlation. May indicate coordinated response to incident.",
      crossVerification: {
        sources: ["TomTom Traffic", "Emergency Dispatch", "Social Media Reports"],
        confidence: 0.73,
        verificationStatus: "likely"
      },
      recommendedActions: [
        "Monitor emergency communications",
        "Check for incident reports",
        "Coordinate with emergency services",
        "Prepare contingency plans"
      ]
    },
    crossVerification: {
      sources: ["TomTom Traffic", "Emergency Dispatch", "Social Media Reports"],
      confidence: 0.73,
      verificationStatus: "likely"
    },
    timestamp: "2025-11-18T02:30:00Z",
    lastUpdated: "2025-11-18T04:45:00Z",
    sourceApis: ["TomTom", "NYC Emergency Services", "Twitter API"],
    tags: ["traffic", "evacuation", "emergency", "coordination"]
  },
  {
    id: "sample-anomaly-005",
    title: "Social Media Crisis Signal - Widespread Panic Reports",
    description: "Spike in social media posts about 'chemical smell' and 'breathing difficulty' across 50km radius, correlated with air quality sensor anomalies.",
    severity: "medium",
    confidence: 0.68,
    status: "detected",
    location: {
      lat: 41.8781,
      lng: -87.6298,
      address: "Chicago, Illinois, USA",
      region: "Great Lakes Region"
    },
    modalities: {
      text: "Social media spike: Hundreds of reports about chemical smell and breathing difficulty. Correlated with air quality sensor alerts in same region.",
      images: [],
      videos: [],
      audio: []
    },
    aiAnalysis: {
      isAnomaly: true,
      severity: "medium",
      confidence: 0.68,
      description: "Coordinated social media signals indicating potential chemical incident. Cross-verification with environmental sensors increases confidence.",
      crossVerification: {
        sources: ["Twitter API", "Reddit API", "Air Quality Sensors"],
        confidence: 0.65,
        verificationStatus: "possible"
      },
      recommendedActions: [
        "Monitor emergency calls",
        "Check air quality sensors",
        "Deploy field teams",
        "Issue public advisory"
      ]
    },
    crossVerification: {
      sources: ["Twitter API", "Reddit API", "Air Quality Sensors"],
      confidence: 0.65,
      verificationStatus: "possible"
    },
    timestamp: "2025-11-18T00:15:00Z",
    lastUpdated: "2025-11-18T01:30:00Z",
    sourceApis: ["Twitter API", "Reddit API", "Local Air Quality Network"],
    tags: ["social-media", "chemical", "public-health", "monitoring"]
  }
];

// Sample API data entries
const sampleApiData = [
  {
    anomalyId: "sample-anomaly-001",
    apiName: "NOAA Satellite",
    endpoint: "imagery",
    rawData: {
      satellite: "GOES-16",
      band: "infrared",
      timestamp: "2025-11-18T06:00:00Z",
      imageUrl: "https://example.com/goes16-ir-001.jpg",
      metadata: {
        cloudTopTemp: -85,
        stormIntensity: "major",
        movement: "NW at 15 mph"
      }
    },
    processedData: {
      stormClassification: "Category 4 Hurricane",
      rapidIntensification: true,
      anomalyScore: 0.95
    },
    dataType: "satellite",
    location: { lat: 25.7617, lng: -80.1918 },
    timestamp: "2025-11-18T06:00:00Z",
    confidence: 0.92,
    status: "processed"
  },
  {
    anomalyId: "sample-anomaly-002",
    apiName: "USGS Earthquake API",
    endpoint: "query",
    rawData: {
      type: "FeatureCollection",
      features: [
        {
          properties: {
            mag: 4.8,
            place: "10km SW of Parkfield, CA",
            time: 1731912000000,
            status: "reviewed"
          },
          geometry: {
            type: "Point",
            coordinates: [-120.432, 35.899, 8.1]
          }
        }
      ]
    },
    processedData: {
      earthquakeCount: 15,
      maxMagnitude: 4.8,
      swarmPattern: true,
      timeWindow: "2 hours",
      concentration: "5km radius"
    },
    dataType: "disaster",
    location: { lat: 35.7796, lng: -119.4179 },
    timestamp: "2025-11-18T04:00:00Z",
    confidence: 0.89,
    status: "processed"
  },
  {
    anomalyId: "sample-anomaly-003",
    apiName: "AirVisual API",
    endpoint: "city",
    rawData: {
      status: "success",
      data: {
        city: "Hong Kong",
        state: "Hong Kong",
        country: "Hong Kong",
        location: {
          type: "Point",
          coordinates: [114.1694, 22.3193]
        },
        current: {
          pollution: {
            ts: "2025-11-18T02:00:00.000Z",
            aqius: 450,
            mainus: "p2",
            aqicn: 180,
            maincn: "p2"
          },
          weather: {
            ts: "2025-11-18T02:00:00.000Z",
            tp: 22,
            pr: 1015,
            hu: 78,
            ws: 2.1,
            wd: 180,
            ic: "10d"
          }
        }
      }
    },
    processedData: {
      pm25Level: 450,
      airQualityIndex: 180,
      pollutant: "PM2.5",
      status: "hazardous",
      baselineComparison: "5x normal"
    },
    dataType: "environmental",
    location: { lat: 22.3193, lng: 114.1694 },
    timestamp: "2025-11-18T02:00:00Z",
    confidence: 0.87,
    status: "processed"
  }
];

// Sample audit log entries
const sampleAuditLogs = [
  {
    anomalyId: "sample-anomaly-001",
    action: "created",
    actor: "system",
    reasoning: "Autonomous anomaly detection from weather satellite data",
    confidence: 0.92,
    changes: { created: true },
    metadata: {
      detectionMethod: "AI_analysis",
      dataSources: ["NOAA", "WeatherAPI"],
      processingTime: 45000
    },
    timestamp: "2025-11-18T05:30:00Z"
  },
  {
    anomalyId: "sample-anomaly-001",
    action: "updated",
    actor: "ai",
    reasoning: "AI analysis completed with cross-verification",
    confidence: 0.92,
    changes: { aiAnalysis: "completed", crossVerification: "confirmed" },
    metadata: {
      aiModel: "gemini-pro-vision",
      verificationSources: 3,
      processingTime: 120000
    },
    timestamp: "2025-11-18T05:45:00Z"
  },
  {
    anomalyId: "sample-anomaly-001",
    action: "approved",
    actor: "human",
    actorId: "analyst_001",
    reasoning: "Manual review confirms critical hurricane threat",
    confidence: 0.95,
    changes: { status: "approved", severity: "critical" },
    metadata: {
      reviewer: "Dr. Sarah Chen",
      reviewTime: 300000,
      additionalNotes: "Immediate evacuation recommended"
    },
    timestamp: "2025-11-18T07:00:00Z"
  }
];

// Generate and save sample data
function generateSampleData() {
  const outputDir = path.join(__dirname, '..', 'data', 'sample');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save anomalies
  fs.writeFileSync(
    path.join(outputDir, 'anomalies.json'),
    JSON.stringify(sampleAnomalies, null, 2)
  );

  // Save API data
  fs.writeFileSync(
    path.join(outputDir, 'api-data.json'),
    JSON.stringify(sampleApiData, null, 2)
  );

  // Save audit logs
  fs.writeFileSync(
    path.join(outputDir, 'audit-logs.json'),
    JSON.stringify(sampleAuditLogs, null, 2)
  );

  console.log('Sample data generated successfully!');
  console.log(`Output directory: ${outputDir}`);
  console.log(`Files created:`);
  console.log(`  - anomalies.json (${sampleAnomalies.length} anomalies)`);
  console.log(`  - api-data.json (${sampleApiData.length} API data entries)`);
  console.log(`  - audit-logs.json (${sampleAuditLogs.length} audit log entries)`);
}

// Run if called directly
if (require.main === module) {
  generateSampleData();
}

module.exports = {
  sampleAnomalies,
  sampleApiData,
  sampleAuditLogs,
  generateSampleData
};