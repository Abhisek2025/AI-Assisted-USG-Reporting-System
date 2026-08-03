# ai-service/app/main.py
"""
FastAPI Microservice Entrypoint for USG Image & Study AI Analysis
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from app.services.cv_analysis import process_usg_study_ai

app = FastAPI(
    title="AI-Assisted USG Reporting Microservice",
    description="FastAPI service for generating draft findings on Ultrasound images.",
    version="1.4.2"
)

class StudyAnalysisRequest(BaseModel):
    study_id: int
    study_type: str = "Abdomen"
    image_urls: Optional[List[str]] = []

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "USG AI Assistive Analysis Microservice",
        "version": "1.4.2",
        "gpu_accelerated": False
    }

@app.post("/ai/analyze-study")
def analyze_study(req: StudyAnalysisRequest):
    try:
        result = process_usg_study_ai(req.study_id, req.study_type, len(req.image_urls or []))
        return {
            "success": True,
            "message": "AI analysis completed successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/result/{study_id}")
def get_ai_result(study_id: int):
    result = process_usg_study_ai(study_id, "Abdomen")
    return {"success": True, "data": result}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
