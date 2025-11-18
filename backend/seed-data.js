// Seed script to populate database with diverse test anomalies
const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbConfig = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  logging: false,
};

if (dbConfig.dialect === 'sqlite') {
  dbConfig.storage = process.env.DB_STORAGE || './gaia.db';
} else if (process.env.DATABASE_URL) {
  dbConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, dbConfig)
  : new Sequelize(dbConfig);

const testAnomalies = [
  {
    title: 'Unusual Seismic Activity Pattern',
    description: 'Multiple low-frequency tremors detected in historically non-seismic zone. Pattern analysis suggests non-natural origin.',
    severity: 'Critical',
    confidence: 0.94,
    status: 'detected',
    location: { lat: 47.6062, lng: -122.3321, name: 'Pacific Northwest' },
    modalities: { text: 'Seismic data analysis', sensor: true },
    aiAnalysis: {
      isAnomaly: true,
      severity: 'Critical',
      confidence: 0.94,
      description: 'Unusual seismic pattern detected',
      recommendedActions: ['Deploy additional sensors', 'Alert geological survey', 'Prepare evacuation protocols']
    },
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    sourceApis: ['usgs', 'sensor-network'],
    tags: ['seismic', 'critical', 'urgent']
  },
  {
    title: 'Atmospheric Pressure Anomaly',
    description: 'Unexpected atmospheric pressure changes detected across multiple monitoring stations.',
    severity: 'High',
    confidence: 0.87,
    status: 'detected',
    location: { lat: 51.5074, lng: -0.1278, name: 'North Atlantic' },
    modalities: { text: 'Weather data', sensor: true },
    aiAnalysis: {
      isAnomaly: true,
      severity: 'High',
      confidence: 0.87,
      description: 'Atmospheric anomaly confirmed',
      recommendedActions: ['Increase monitoring', 'Alert aviation authorities', 'Weather analysis']
    },
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    sourceApis: ['openweather', 'weatherbit'],
    tags: ['weather', 'atmospheric', 'high-priority']
  },
  {
    title: 'Unidentified Aerial Phenomena',
    description: 'Multiple radar contacts with unusual flight characteristics. Visual confirmation pending.',
    severity: 'High',
    confidence: 0.82,
    status: 'approved',
    location: { lat: 48.8566, lng: 2.3522, name: 'European Airspace' },
    modalities: { text: 'Radar data', image: true },
    aiAnalysis: {
      isAnomaly: true,
      severity: 'High',
      confidence: 0.82,
      description: 'Unusual aerial activity',
      recommendedActions: ['Scramble intercept', 'Enhance radar', 'Coordinate defense']
    },
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    sourceApis: ['radar-network', 'aviation-data'],
    tags: ['aerial', 'radar', 'investigation']
  },
  {
    title: 'Electromagnetic Interference Spike',
    description: 'Widespread communication disruptions in urban area. Multiple frequency bands affected.',
    severity: 'Medium',
    confidence: 0.76,
    status: 'rejected',
    location: { lat: 35.6762, lng: 139.6503, name: 'Tokyo Metropolitan' },
    modalities: { text: 'EM sensor data', sensor: true },
    aiAnalysis: {
      isAnomaly: true,
      severity: 'Medium',
      confidence: 0.76,
      description: 'EM interference detected',
      recommendedActions: ['Monitor', 'Document', 'Investigate source']
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    sourceApis: ['em-sensors', 'telecom-data'],
    tags: ['electromagnetic', 'resolved', 'urban']
  },
  {
    title: 'Unusual Marine Activity',
    description: 'Sonar contacts with unidentified underwater objects. Multiple vessels reporting anomalies.',
    severity: 'High',
    confidence: 0.89,
    status: 'detected',
    location: { lat: 25.7617, lng: -80.1918, name: 'Atlantic Ocean' },
    modalities: { text: 'Sonar data', audio: true },
    aiAnalysis: {
      isAnomaly: true,
      severity: 'High',
      confidence: 0.89,
      description: 'Underwater anomaly detected',
      recommendedActions: ['Deploy naval assets', 'Increase sonar coverage', 'Coordinate with coast guard']
    },
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    sourceApis: ['sonar-network', 'maritime-data'],
    tags: ['marine', 'sonar', 'investigation']
  },
  {
    title: 'Radiation Level Fluctuation',
    description: 'Unexpected radiation readings in monitored area. Levels within safe range but pattern is unusual.',
    severity: 'Medium',
    confidence: 0.73,
    status: 'detected',
    location: { lat: 51.3811, lng: 30.0992, name: 'Eastern Europe' },
    modalities: { text: 'Radiation sensors', sensor: true },
    aiAnalysis: {
      isAnomaly: true,
      severity: 'Medium',
      confidence: 0.73,
      description: 'Radiation pattern anomaly',
      recommendedActions: ['Continue monitoring', 'Check equipment', 'Alert authorities']
    },
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    sourceApis: ['radiation-monitors', 'environmental-data'],
    tags: ['radiation', 'environmental', 'monitoring']
  },
  {
    title: 'Cyber Infrastructure Anomaly',
    description: 'Unusual network traffic patterns detected across multiple data centers. Potential coordinated activity.',
    severity: 'Critical',
    confidence: 0.91,
    status: 'detected',
    location: { lat: 37.7749, lng: -122.4194, name: 'San Francisco Bay Area' },
    modalities: { text: 'Network data', sensor: true },
    aiAnalysis: {
      isAnomaly: true,
      severity: 'Critical',
      confidence: 0.91,
      description: 'Cyber threat detected',
      recommendedActions: ['Activate cyber defense', 'Isolate affected systems', 'Alert security teams']
    },
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    sourceApis: ['network-monitors', 'security-feeds'],
    tags: ['cyber', 'critical', 'security']
  },
  {
    title: 'Volcanic Activity Increase',
    description: 'Increased seismic activity and gas emissions detected near dormant volcano.',
    severity: 'High',
    confidence: 0.88,
    status: 'detected',
    location: { lat: 19.4326, lng: -155.5915, name: 'Hawaii' },
    modalities: { text: 'Seismic and gas sensors', sensor: true },
    aiAnalysis: {
      isAnomaly: true,
      severity: 'High',
      confidence: 0.88,
      description: 'Volcanic activity anomaly',
      recommendedActions: ['Increase monitoring', 'Alert local authorities', 'Prepare evacuation plans']
    },
    timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    sourceApis: ['usgs', 'volcanic-monitors'],
    tags: ['volcanic', 'geological', 'high-priority']
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with test anomalies...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Import models
    const { initializeDatabase } = require('./models');
    const models = await initializeDatabase(sequelize);
    
    console.log('✅ Models initialized');

    // Clear existing test data (optional)
    // await models.Anomaly.destroy({ where: { tags: { [Op.contains]: ['test'] } } });

    // Create anomalies
    for (const anomalyData of testAnomalies) {
      const anomaly = await models.Anomaly.create(anomalyData);
      console.log(`✅ Created anomaly: ${anomaly.title}`);

      // Create audit log
      await models.AuditLog.create({
        anomalyId: anomaly.id,
        action: 'created',
        actor: 'system',
        reasoning: 'Test data seeding',
        changes: { created: true },
        currentState: anomaly.toJSON()
      });
    }

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log(`📊 Created ${testAnomalies.length} test anomalies`);
    console.log('');
    console.log('You can now:');
    console.log('1. Visit http://localhost:3000/#/dashboard');
    console.log('2. Check http://localhost:3001/api/anomalies');
    console.log('3. View http://localhost:3001/api/alerts');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
