from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys, os

# Add parent dir so routers can import ai/* and data/*
sys.path.insert(0, os.path.dirname(__file__))

from routers import jobs, resume, skills, interview

app = FastAPI(
    title="SkillBridge AI API",
    description="AI-powered job matching and career assistant backend",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(jobs.router, prefix="/api", tags=["Jobs"])
app.include_router(resume.router, prefix="/api", tags=["Resume"])
app.include_router(skills.router, prefix="/api", tags=["Skills"])
app.include_router(interview.router, prefix="/api", tags=["Interview"])

@app.get("/")
def root():
    return {
        "app": "SkillBridge AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "ok"}
