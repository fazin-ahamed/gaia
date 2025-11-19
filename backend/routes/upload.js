const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  analyzeImage,
  analyzeText,
  analyzePDF,
  crossVerifyAnalyses
} = require('../services/fileAnalysis');
const { triggerOpusWorkflow } = require('../services/opusIntegration');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images, PDF, text'));
    }
  }
});

// Upload and analyze single file
router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, mimetype, originalname } = req.file;
    const { description, location, title } = req.body;

    let analysis;

    // Route to appropriate analyzer based on file type
    if (mimetype.startsWith('image/')) {
      analysis = await analyzeImage(buffer, originalname);
    } else if (mimetype === 'application/pdf') {
      analysis = await analyzePDF(buffer, originalname);
    } else if (mimetype.startsWith('text/')) {
      const text = buffer.toString('utf-8');
      analysis = await analyzeText(text);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Add metadata
    analysis.metadata = {
      description: description || '',
      location: location || 'Unknown',
      uploadedAt: new Date().toISOString(),
      fileName: originalname
    };

    // Save to database if anomaly detected
    let savedAnomaly = null;
    if (analysis.isAnomaly && !analysis.anomalyScore?.isFake) {
      try {
        // Parse location if provided as JSON string
        let locationData = null;
        if (location) {
          try {
            locationData = typeof location === 'string' ? JSON.parse(location) : location;
          } catch (e) {
            locationData = { address: location };
          }
        }

        // Create anomaly in database
        savedAnomaly = await global.models.Anomaly.create({
          title: title || `Uploaded ${mimetype.split('/')[0]} anomaly`,
          description: description || analysis.reasoning,
          severity: analysis.anomalyScore?.severity?.toLowerCase() || 'medium',
          confidence: analysis.confidence,
          status: 'detected',
          location: locationData,
          modalities: {
            type: mimetype.split('/')[0],
            fileName: originalname,
            fileType: mimetype
          },
          aiAnalysis: analysis,
          timestamp: new Date(),
          lastUpdated: new Date(),
          tags: ['uploaded', mimetype.split('/')[0], 'user-reported']
        });

        // Trigger Opus workflow
        const opusResult = await triggerOpusWorkflow({
          id: savedAnomaly.id,
          title: savedAnomaly.title,
          description: savedAnomaly.description,
          severity: savedAnomaly.severity,
          confidence: savedAnomaly.confidence,
          location: locationData,
          timestamp: savedAnomaly.timestamp.toISOString(),
          modalities: [mimetype.split('/')[0]],
          aiAnalysis: analysis,
          metadata: analysis.metadata
        });

        analysis.opusWorkflow = opusResult;
        analysis.savedAnomaly = {
          id: savedAnomaly.id,
          title: savedAnomaly.title,
          status: savedAnomaly.status
        };
      } catch (dbError) {
        console.error('Database save error:', dbError);
        analysis.dbError = 'Failed to save to database';
      }
    }

    res.json({
      ...analysis,
      saved: !!savedAnomaly,
      anomalyId: savedAnomaly?.id
    });
  } catch (error) {
    console.error('Upload analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload and analyze multiple files
router.post('/analyze-multiple', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { description, location } = req.body;

    // Analyze all files
    const analyses = await Promise.all(
      req.files.map(async (file) => {
        const { buffer, mimetype, originalname } = file;

        if (mimetype.startsWith('image/')) {
          return await analyzeImage(buffer, originalname);
        } else if (mimetype === 'application/pdf') {
          return await analyzePDF(buffer, originalname);
        } else if (mimetype.startsWith('text/')) {
          const text = buffer.toString('utf-8');
          return await analyzeText(text);
        }
        
        return null;
      })
    );

    // Filter out null results
    const validAnalyses = analyses.filter(a => a !== null);

    // Cross-verify all analyses
    const verification = crossVerifyAnalyses(validAnalyses);

    // Add metadata
    verification.metadata = {
      description: description || '',
      location: location || 'Unknown',
      uploadedAt: new Date().toISOString(),
      fileCount: validAnalyses.length
    };

    res.json({
      individual: validAnalyses,
      verification,
      summary: {
        totalFiles: req.files.length,
        analyzed: validAnalyses.length,
        isAnomaly: verification.isAnomaly,
        confidence: verification.confidence,
        severity: verification.severity,
        isFake: verification.isFake || false
      }
    });
  } catch (error) {
    console.error('Multiple upload analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze text directly (no file upload)
router.post('/analyze-text', async (req, res) => {
  try {
    const { text, description, location } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text content required' });
    }

    const analysis = await analyzeText(text);

    analysis.metadata = {
      description: description || '',
      location: location || 'Unknown',
      analyzedAt: new Date().toISOString()
    };

    res.json(analysis);
  } catch (error) {
    console.error('Text analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get upload statistics
router.get('/stats', async (req, res) => {
  try {
    // In production, this would query a database
    res.json({
      totalUploads: 1247,
      anomaliesDetected: 342,
      fakeContentFlagged: 89,
      averageConfidence: 0.847,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
