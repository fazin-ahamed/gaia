const express = require('express');
const router = express.Router();
const {
  fetchWeatherData,
  fetchAirQuality,
  fetchNewsData,
  fetchGDELTEvents,
  fetchGDACSEvents,
  aggregateAnomalyData,
  analyzeWithAgentSwarm
} = require('../services/externalAPIs');

// Get real-time weather data
router.get('/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const data = await fetchWeatherData(parseFloat(lat), parseFloat(lon));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get air quality data
router.get('/air-quality', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const data = await fetchAirQuality(parseFloat(lat), parseFloat(lon));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get news data
router.get('/news', async (req, res) => {
  try {
    const { query, country } = req.query;
    const data = await fetchNewsData(query || 'anomaly', country || 'us');
    res.json({ 
      articles: data,
      totalResults: data.length,
      status: 'ok'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get GDELT events
router.get('/events', async (req, res) => {
  try {
    const data = await fetchGDELTEvents();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aggregate multi-source data
router.post('/aggregate', async (req, res) => {
  try {
    const { lat, lon, query } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const data = await aggregateAnomalyData(
      parseFloat(lat),
      parseFloat(lon),
      query || 'anomaly'
    );
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze with agent swarm
router.post('/analyze', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Data required for analysis' });
    }

    const analysis = await analyzeWithAgentSwarm(data);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get global hotspots (aggregated anomalies)
router.get('/hotspots', async (req, res) => {
  try {
    // Fetch GDACS disasters
    const gdacsData = await fetchGDACSEvents();
    
    // Convert GDACS events to hotspots
    const gdacsHotspots = gdacsData.features.map(feature => {
      const coords = feature.geometry.coordinates;
      const props = feature.properties;
      
      // Map alert level to severity
      let severity = 'Low';
      if (props.alertLevel === 'Red') severity = 'Critical';
      else if (props.alertLevel === 'Orange') severity = 'High';
      else if (props.alertLevel === 'Green') severity = 'Medium';
      
      return {
        name: props.name || props.eventName,
        lat: coords[1],
        lon: coords[0],
        severity,
        type: 'disaster',
        source: 'GDACS',
        data: {
          eventType: props.eventType,
          alertLevel: props.alertLevel,
          alertScore: props.alertScore,
          description: props.description,
          country: props.country,
          affectedCountries: props.affectedCountries,
          fromDate: props.fromDate,
          toDate: props.toDate,
          isCurrent: props.isCurrent,
          url: props.url
        },
        analysis: {
          consensus: props.alertScore / 3, // Normalize to 0-1
          agents: [{
            type: 'disaster',
            confidence: props.alertScore / 3,
            output: props.description
          }]
        }
      };
    });

    // Major cities for monitoring
    const locations = [
      { name: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333 }
    ];

    const cityHotspots = await Promise.all(
      locations.map(async (loc) => {
        try {
          const data = await aggregateAnomalyData(loc.lat, loc.lon, 'anomaly');
          const analysis = await analyzeWithAgentSwarm(data);
          
          return {
            ...loc,
            type: 'city',
            source: 'multi-source',
            data,
            analysis,
            severity: analysis.consensus > 0.8 ? 'High' : analysis.consensus > 0.6 ? 'Medium' : 'Low'
          };
        } catch (error) {
          console.error(`Error fetching data for ${loc.name}:`, error.message);
          return {
            ...loc,
            type: 'city',
            source: 'multi-source',
            severity: 'Low',
            analysis: { consensus: 0.5, agents: [] },
            error: error.message
          };
        }
      })
    );

    // Combine GDACS disasters with city hotspots
    const allHotspots = [...gdacsHotspots, ...cityHotspots];

    res.json({
      hotspots: allHotspots,
      summary: {
        total: allHotspots.length,
        disasters: gdacsHotspots.length,
        cities: cityHotspots.length,
        critical: allHotspots.filter(h => h.severity === 'Critical').length,
        high: allHotspots.filter(h => h.severity === 'High').length,
        medium: allHotspots.filter(h => h.severity === 'Medium').length,
        low: allHotspots.filter(h => h.severity === 'Low').length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Hotspots error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync GDACS disasters to database with Opus cross-verification
router.post('/sync-disasters', async (req, res) => {
  try {
    const { triggerOpusWorkflow } = require('../services/opusIntegration');
    const gdacsData = await fetchGDACSEvents();
    const savedAnomalies = [];
    const errors = [];
    const verified = [];

    for (const feature of gdacsData.features) {
      try {
        const coords = feature.geometry.coordinates;
        const props = feature.properties;
        
        // Check if already exists
        const existing = await global.models.Anomaly.findOne({
          where: {
            tags: {
              [require('sequelize').Op.contains]: [`gdacs-${props.eventId}`]
            }
          }
        });

        if (existing) {
          continue; // Skip if already in database
        }

        // Map alert level to severity
        let severity = 'low';
        if (props.alertLevel === 'Red') severity = 'critical';
        else if (props.alertLevel === 'Orange') severity = 'high';
        else if (props.alertLevel === 'Green') severity = 'medium';

        // Create anomaly
        const anomaly = await global.models.Anomaly.create({
          title: props.name || props.eventName,
          description: props.description,
          severity,
          confidence: props.alertScore / 3, // Normalize to 0-1
          status: props.isCurrent === 'true' ? 'detected' : 'reviewed',
          location: {
            lat: coords[1],
            lng: coords[0],
            address: props.country
          },
          modalities: {
            type: 'disaster',
            eventType: props.eventType,
            source: 'GDACS'
          },
          aiAnalysis: {
            source: 'GDACS',
            alertLevel: props.alertLevel,
            alertScore: props.alertScore,
            severity: props.severity,
            affectedCountries: props.affectedCountries,
            url: props.url
          },
          timestamp: new Date(props.fromDate || Date.now()),
          lastUpdated: new Date(props.dateModified || Date.now()),
          tags: [
            'gdacs',
            `gdacs-${props.eventId}`,
            props.eventType,
            'disaster',
            props.alertLevel.toLowerCase()
          ]
        });

        savedAnomalies.push({
          id: anomaly.id,
          title: anomaly.title,
          eventId: props.eventId
        });

        // Trigger Opus workflow for cross-verification (only for high severity)
        if (severity === 'critical' || severity === 'high') {
          try {
            const opusResult = await triggerOpusWorkflow({
              id: anomaly.id,
              title: anomaly.title,
              description: anomaly.description,
              severity: anomaly.severity,
              confidence: anomaly.confidence,
              location: anomaly.location,
              timestamp: anomaly.timestamp.toISOString(),
              modalities: ['disaster', props.eventType],
              aiAnalysis: anomaly.aiAnalysis,
              metadata: {
                source: 'GDACS',
                eventId: props.eventId,
                alertLevel: props.alertLevel,
                crossVerificationRequested: true
              }
            });

            if (opusResult && opusResult.success) {
              verified.push({
                anomalyId: anomaly.id,
                jobExecutionId: opusResult.jobExecutionId
              });
            }
          } catch (opusError) {
            console.error('Opus verification failed:', opusError.message);
            // Continue even if Opus fails
          }
        }
      } catch (error) {
        errors.push({
          eventId: feature.properties.eventId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      synced: savedAnomalies.length,
      verified: verified.length,
      errors: errors.length,
      savedAnomalies,
      verifiedAnomalies: verified,
      errors: errors.length > 0 ? errors : undefined,
      message: `Synced ${savedAnomalies.length} disasters, ${verified.length} sent to Opus for cross-verification`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync disasters error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
