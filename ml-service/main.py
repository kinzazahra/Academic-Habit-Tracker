from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import random

app = FastAPI(title="SentinelAI Detection Engine")

class LogPayload(BaseModel):
    eventType: str
    details: dict

@app.post("/analyze")
async def analyze_log(payload: LogPayload):
    # In production, vectorization profiles map categorical events to statistical arrays
    # E.g., failure_counts, unique_ip_counts, resource_delta
    
    event_type = payload.eventType
    details = payload.details
    
    # Simple deterministic evaluation mapping to mimic downstream ML inference
    is_anomaly = False
    severity = "Low"
    confidence = 0.92

    if event_type == "SSH_LOGIN_ATTEMPT" and details.get("failedAttempts", 0) > 5:
        is_anomaly = True
        severity = "High"
        confidence = 0.97
    elif "encryption_extension" in details.get("action", "") or ".locked" in details.get("file", ""):
        is_anomaly = True
        severity = "Critical"
        confidence = 0.99
    elif details.get("dataTransferredGB", 0) > 50:
        is_anomaly = True
        severity = "Medium"
        confidence = 0.89

    return {
        "isAnomaly": is_anomaly,
        "severity": severity,
        "confidenceScore": confidence
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)