import mongoose from 'mongoose';

const ThreatSchema = new mongoose.Schema({
  logId: { type: mongoose.Schema.Types.ObjectId, ref: 'Log' },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    required: true 
  },
  confidenceScore: { type: Number, required: true },
  detectedAt: { type: Date, default: Date.now },
  rawDetails: { type: Object, required: true },
  aiExplanation: { type: String, required: true },
  remediationSteps: { type: String, required: true }
});

export default mongoose.model('Threat', ThreatSchema);