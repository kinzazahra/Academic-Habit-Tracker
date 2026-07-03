import express from 'express';
import axios from 'axios';
import Log from '../models/Log.js';
import Threat from '../models/Threat.js';
import { io } from '../server.js';

const router = express.Router();

// Route to ingest logs and run them through ML + LLM pipelines
router.post('/ingest', async (req, res) => {
  try {
    const { source, eventType, details, userId } = req.body;
    
    // 1. Save raw log to MongoDB
    const newLog = await Log.create({ source, eventType, details, actor: userId });
    
    // Broadcast the raw log to frontend instantly
    io.emit('raw_log_stream', newLog);

    // 2. Forward payload to Python Microservice for Anomaly Detection
    const mlResponse = await axios.post('http://localhost:8000/analyze', {
      eventType,
      details
    });

    const { isAnomaly, severity, confidenceScore } = mlResponse.data;

    // 3. If flagged as anomaly, generate context via local Llama 3 (Ollama)
    if (isAnomaly) {
      const ollamaPrompt = `You are a Tier-3 Incident Response Expert. Analyze this suspicious event:
      Type: ${eventType}
      Metadata: ${JSON.stringify(details)}
      Severity Assessment: ${severity}
      
      Provide a brief 2-sentence explanation of why this is dangerous, followed by explicit instructions for remediation labeled "Remediation:".`;

      const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
        model: 'llama3',
        prompt: ollamaPrompt,
        stream: false
      });

      const fullAiText = ollamaResponse.data.response;
      const [explanation, remediation] = fullAiText.split('Remediation:');

      // 4. Save threat file to Database
      const threatRecord = await Threat.create({
        logId: newLog._id,
        severity,
        confidenceScore,
        rawDetails: details,
        aiExplanation: explanation.trim(),
        remediationSteps: remediation ? remediation.trim() : 'Isolate the affected infrastructure resource immediately.'
      });

      // 5. Broadcast security alert via WebSockets
      io.emit('security_alert', threatRecord);
    }

    return res.status(201).json({ success: true, processedLogId: newLog._id, isAnomaly });
  } catch (error) {
    console.error('Ingestion Pipeline Failure:', error.message);
    return res.status(500).json({ error: 'Failed to process security log configuration.' });
  }
});

export default router;