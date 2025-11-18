const axios = require('axios');
const { Op } = require('sequelize');
const winston = require('winston');
const { analyzeAnomalyData, crossVerifyData } = require('./geminiAI');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/data-ingestion.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// API configurations
const API_CONFIGS = {
  weather: [
    {
      name: 'openweathermap',
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      endpoints: ['weather', 'forecast'],
      params: { appid: process.env.OPENWEATHER_API_KEY },
      requiresLocation: true,
    },
    {
      name: 'weatherbit',
      baseUrl: 'https://api.weatherbit.io/v2.0',
      endpoints: ['current', 'forecast/daily'],
      params: { key: process.env.WEATHERBIT_API_KEY },
      requiresLocation: true,
    }
  ],
  satellite: [
    {
      name: 'nasa_earthdata',
      baseUrl: 'https://api.nasa.gov/planetary/earth',
      endpoints: ['imagery'],
      params: { api_key: process.env.NASA_API_KEY },
      requiresLocation: true,
    }
  ],
  news: [
    // NewsAPI disabled to prevent fetch errors
    // {
    //   name: 'newsapi',
    //   baseUrl: 'https://newsapi.org/v2',
    //   endpoints: ['top-headlines', 'everything'],
    //   params: { apiKey: process.env.NEWSAPI_KEY },
    //   requiresLocation: false,
    // },
    {
      name: 'gdeltdata',
      baseUrl: 'https://api.gdeltproject.org/api/v2',
      endpoints: ['doc/doc'],
      params: { query: 'domain:news' },
      requiresLocation: false,
    }
  ],
  disasters: [
    {
      name: 'usgs_earthquake',
      baseUrl: 'https://earthquake.usgs.gov/fdsnws/event/1',
      endpoints: ['query'],
      params: {},
      requiresLocation: false,
    },
    {
      name: 'eonet',
      baseUrl: 'https://eonet.gsfc.nasa.gov/api/v3',
      endpoints: ['events'],
      params: { api_key: process.env.EONET_API_KEY },
      requiresLocation: false,
    }
  ],
  traffic: [
    {
      name: 'tomtom',
      baseUrl: 'https://api.tomtom.com/traffic/services/4',
      endpoints: ['flowSegmentData'],
      params: { key: process.env.TOMTOM_API_KEY },
      requiresLocation: true,
    }
  ],
  social: [
    {
      name: 'reddit',
      baseUrl: 'https://www.reddit.com/r',
      endpoints: ['all/hot.json'],
      params: {},
      requiresLocation: false,
    }
  ],
  iot: [
    {
      name: 'thingspeak',
      baseUrl: 'https://api.thingspeak.com/channels',
      endpoints: [],
      params: { api_key: process.env.THINGSPEAK_API_KEY },
      requiresLocation: false,
    }
  ],
  environmental: [
    {
      name: 'airvisual',
      baseUrl: 'https://api.airvisual.com/v2',
      endpoints: ['nearest_city', 'cities'],
      params: { key: process.env.AIRVISUAL_API_KEY },
      requiresLocation: true,
    }
  ]
};

// Global data cache to avoid duplicate processing
const dataCache = new Map();

async function fetchFromAPI(apiConfig, location = null) {
  try {
    const { name, baseUrl, endpoints, params, requiresLocation } = apiConfig;

    // Skip if location required but not provided
    if (requiresLocation && !location) {
      return null;
    }

    for (const endpoint of endpoints) {
      try {
        const url = `${baseUrl}/${endpoint}`;
        const requestParams = { ...params };

        // Add location parameters if required
        if (requiresLocation && location) {
          if (name.includes('openweather') || name.includes('weatherbit')) {
            requestParams.lat = location.lat;
            requestParams.lon = location.lng;
          } else if (name.includes('tomtom')) {
            requestParams.point = `${location.lat},${location.lng}`;
          } else if (name.includes('nasa')) {
            requestParams.lat = location.lat;
            requestParams.lon = location.lng;
            requestParams.dim = '0.1';
          }
        }

        // Add timestamp to avoid caching
        requestParams._t = Date.now();

        const response = await axios.get(url, {
          params: requestParams,
          timeout: 10000,
          headers: {
            'User-Agent': 'GAIA-Anomaly-Detection/1.0',
          }
        });

        if (response.data) {
          logger.info(`Data fetched from ${name}/${endpoint}`);
          return {
            apiName: name,
            endpoint,
            data: response.data,
            timestamp: new Date(),
            location,
            status: 'success'
          };
        }

      } catch (endpointError) {
        logger.warn(`Failed to fetch from ${name}/${endpoint}:`, endpointError.message);
        continue;
      }
    }

    return null;

  } catch (error) {
    logger.error(`API fetch error for ${apiConfig.name}:`, error.message);
    return {
      apiName: apiConfig.name,
      error: error.message,
      timestamp: new Date(),
      status: 'error'
    };
  }
}

async function collectDataFromAPIs(location = null, dataTypes = null) {
  const collectedData = [];
  const apisToQuery = dataTypes ? API_CONFIGS[dataTypes] : Object.values(API_CONFIGS).flat();

  logger.info(`Starting data collection from ${apisToQuery.length} APIs`);

  // Parallel API calls with rate limiting
  const promises = apisToQuery.map(async (apiConfig) => {
    // Simple rate limiting - add random delay
    const delay = Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    return fetchFromAPI(apiConfig, location);
  });

  const results = await Promise.allSettled(promises);

  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      collectedData.push(result.value);
    } else if (result.status === 'rejected') {
      logger.error('API call failed:', result.reason);
    }
  });

  logger.info(`Collected data from ${collectedData.length} APIs`);
  return collectedData;
}

async function processCollectedData(collectedData) {
  const processedData = [];

  for (const dataItem of collectedData) {
    try {
      if (dataItem.status === 'error') continue;

      // Normalize data based on API type
      const normalizedData = normalizeData(dataItem);

      if (normalizedData) {
        processedData.push({
          ...dataItem,
          processedData: normalizedData,
          dataType: inferDataType(dataItem.apiName),
          confidence: calculateDataConfidence(normalizedData)
        });
      }

    } catch (error) {
      logger.error(`Data processing failed for ${dataItem.apiName}:`, error);
    }
  }

  return processedData;
}

function normalizeData(dataItem) {
  const { apiName, data } = dataItem;

  // Normalize based on API type
  if (apiName.includes('openweather') || apiName.includes('weatherbit')) {
    return normalizeWeatherData(data, apiName);
  } else if (apiName.includes('newsapi') || apiName.includes('gdeltdata')) {
    return normalizeNewsData(data, apiName);
  } else if (apiName.includes('usgs') || apiName.includes('eonet')) {
    return normalizeDisasterData(data, apiName);
  } else if (apiName.includes('tomtom')) {
    return normalizeTrafficData(data, apiName);
  } else if (apiName.includes('airvisual')) {
    return normalizeEnvironmentalData(data, apiName);
  }

  // Return raw data for unknown APIs
  return data;
}

function normalizeWeatherData(data, apiName) {
  if (apiName.includes('openweather')) {
    return {
      temperature: data.main?.temp,
      humidity: data.main?.humidity,
      pressure: data.main?.pressure,
      windSpeed: data.wind?.speed,
      weather: data.weather?.[0]?.description,
      visibility: data.visibility,
      location: {
        lat: data.coord?.lat,
        lng: data.coord?.lon,
        city: data.name
      }
    };
  } else if (apiName.includes('weatherbit')) {
    return {
      temperature: data.data?.[0]?.temp,
      humidity: data.data?.[0]?.rh,
      pressure: data.data?.[0]?.pres,
      windSpeed: data.data?.[0]?.wind_spd,
      weather: data.data?.[0]?.weather?.description,
      location: {
        lat: data.lat,
        lng: data.lon,
        city: data.city_name
      }
    };
  }
  return data;
}

function normalizeNewsData(data, apiName) {
  if (apiName.includes('newsapi')) {
    return {
      articles: data.articles?.map(article => ({
        title: article.title,
        description: article.description,
        source: article.source?.name,
        publishedAt: article.publishedAt,
        url: article.url
      })) || []
    };
  }
  return data;
}

function normalizeDisasterData(data, apiName) {
  if (apiName.includes('usgs')) {
    return {
      earthquakes: data.features?.map(feature => ({
        magnitude: feature.properties.mag,
        location: feature.properties.place,
        coordinates: feature.geometry.coordinates,
        time: new Date(feature.properties.time),
        tsunami: feature.properties.tsunami
      })) || []
    };
  } else if (apiName.includes('eonet')) {
    return {
      events: data.events?.map(event => ({
        title: event.title,
        description: event.description,
        categories: event.categories?.map(cat => cat.title),
        geometries: event.geometries,
        sources: event.sources
      })) || []
    };
  }
  return data;
}

function normalizeTrafficData(data, apiName) {
  if (apiName.includes('tomtom')) {
    return {
      trafficFlow: {
        speed: data.flowSegmentData?.currentSpeed,
        freeFlowSpeed: data.flowSegmentData?.freeFlowSpeed,
        confidence: data.flowSegmentData?.confidence,
        roadClosure: data.flowSegmentData?.roadClosure
      }
    };
  }
  return data;
}

function normalizeEnvironmentalData(data, apiName) {
  if (apiName.includes('airvisual')) {
    return {
      airQuality: {
        aqi: data.data?.current?.pollution?.aqius,
        mainPollutant: data.data?.current?.pollution?.mainus,
        temperature: data.data?.current?.weather?.tp,
        humidity: data.data?.current?.weather?.hu,
        windSpeed: data.data?.current?.weather?.ws
      },
      location: {
        city: data.data?.city,
        state: data.data?.state,
        country: data.data?.country,
        coordinates: data.data?.location?.coordinates
      }
    };
  }
  return data;
}

function inferDataType(apiName) {
  if (apiName.includes('weather')) return 'weather';
  if (apiName.includes('news') || apiName.includes('gdelt')) return 'news';
  if (apiName.includes('usgs') || apiName.includes('eonet')) return 'disaster';
  if (apiName.includes('tomtom')) return 'traffic';
  if (apiName.includes('airvisual')) return 'environmental';
  if (apiName.includes('thingspeak')) return 'iot';
  if (apiName.includes('reddit')) return 'social';
  if (apiName.includes('nasa')) return 'satellite';
  return 'unknown';
}

function calculateDataConfidence(data) {
  // Simple confidence calculation based on data completeness
  let score = 0.5; // Base confidence

  if (data && typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length > 5) score += 0.2; // Rich data
    if (keys.includes('location') || keys.includes('coordinates')) score += 0.1; // Geospatial
    if (keys.includes('timestamp') || keys.includes('time')) score += 0.1; // Temporal
    if (keys.includes('confidence') && data.confidence > 0.7) score += 0.1; // API-provided confidence
  }

  return Math.min(score, 1.0);
}

async function startDataIngestion() {
  try {
    logger.info('Starting autonomous data ingestion cycle');

    // Collect data from global sources (no specific location)
    const globalData = await collectDataFromAPIs();

    // Process collected data
    const processedData = await processCollectedData(globalData);

    // Group data by potential anomaly patterns
    const anomalyCandidates = await identifyAnomalyCandidates(processedData);

    // Create anomalies for candidates with high confidence
    for (const candidate of anomalyCandidates) {
      if (candidate.confidence > 0.7) {
        await createAnomalyFromData(candidate);
      }
    }

    logger.info(`Data ingestion cycle completed. Processed ${processedData.length} data points, created ${anomalyCandidates.filter(c => c.confidence > 0.7).length} anomalies`);

  } catch (error) {
    logger.error('Data ingestion cycle failed:', error);
  }
}

async function identifyAnomalyCandidates(processedData) {
  const candidates = [];

  // Group data by location and time window
  const groupedData = groupDataByLocationAndTime(processedData);

  for (const [locationKey, locationData] of Object.entries(groupedData)) {
    try {
      // Use Gemini AI to analyze for anomalies
      const analysis = await analyzeAnomalyData({
        modalities: aggregateModalities(locationData),
        location: parseLocationKey(locationKey),
        timestamp: new Date(),
        sourceApis: locationData.map(d => d.apiName)
      });

      if (analysis.isAnomaly === true || analysis.isAnomaly === 'yes') {
        candidates.push({
          location: parseLocationKey(locationKey),
          data: locationData,
          analysis,
          confidence: analysis.confidence,
          severity: analysis.severity,
          timestamp: new Date()
        });
      }

    } catch (error) {
      logger.error(`Anomaly analysis failed for location ${locationKey}:`, error);
    }
  }

  return candidates;
}

function groupDataByLocationAndTime(data) {
  const groups = {};

  data.forEach(item => {
    let locationKey = 'global';

    if (item.location) {
      locationKey = `${item.location.lat?.toFixed(2) || 0}_${item.location.lng?.toFixed(2) || 0}`;
    }

    if (!groups[locationKey]) {
      groups[locationKey] = [];
    }

    groups[locationKey].push(item);
  });

  return groups;
}

function aggregateModalities(data) {
  const modalities = { text: '', images: [], videos: [], audio: [] };

  // Aggregate text from news and social data
  const textSources = data.filter(d =>
    d.dataType === 'news' || d.dataType === 'social'
  );

  modalities.text = textSources.map(d =>
    JSON.stringify(d.processedData)
  ).join('\n');

  // Aggregate images from satellite and social data
  const imageSources = data.filter(d =>
    d.dataType === 'satellite'
  );

  // Note: In a real implementation, you'd handle image data from APIs
  modalities.images = imageSources.map(d => ({
    data: 'placeholder', // Base64 encoded image data
    mimeType: 'image/jpeg'
  }));

  return modalities;
}

function parseLocationKey(key) {
  if (key === 'global') return null;

  const [lat, lng] = key.split('_').map(Number);
  return { lat, lng };
}

async function createAnomalyFromData(candidate) {
  try {
    const { models } = require('../models');
    const { Anomaly, ApiData, AuditLog } = models;

    // Create anomaly
    const anomaly = await Anomaly.create({
      title: `Potential Anomaly Detected - ${candidate.analysis.description?.substring(0, 50)}...`,
      description: candidate.analysis.description,
      severity: candidate.analysis.severity || 'medium',
      confidence: candidate.analysis.confidence || 0.5,
      status: 'detected',
      location: candidate.location,
      modalities: candidate.data.reduce((acc, d) => {
        if (d.dataType === 'news') acc.text = (acc.text || '') + JSON.stringify(d.processedData) + '\n';
        return acc;
      }, {}),
      aiAnalysis: candidate.analysis,
      timestamp: candidate.timestamp,
      sourceApis: candidate.data.map(d => d.apiName),
      tags: ['autonomous', 'ai-detected']
    });

    // Create API data records
    for (const dataItem of candidate.data) {
      await ApiData.create({
        anomalyId: anomaly.id,
        ...dataItem
      });
    }

    // Create audit log
    await AuditLog.create({
      anomalyId: anomaly.id,
      action: 'created',
      actor: 'system',
      reasoning: 'Autonomous anomaly detection via data ingestion',
      confidence: candidate.confidence,
      changes: { created: true },
      currentState: anomaly.toJSON()
    });

    logger.info(`Created anomaly ${anomaly.id} from autonomous detection`);

    return anomaly;

  } catch (error) {
    logger.error('Failed to create anomaly from data:', error);
    throw error;
  }
}

module.exports = {
  startDataIngestion,
  collectDataFromAPIs,
  processCollectedData,
  fetchFromAPI,
};