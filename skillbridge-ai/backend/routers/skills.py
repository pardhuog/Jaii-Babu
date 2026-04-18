from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from ai.matcher import get_missing_skills, get_matching_skills
from data.data_store import JOBS

router = APIRouter()

LEARNING_PATHS = {
    "Python": [
        {"resource": "Python for Everybody - Coursera", "url": "https://coursera.org/learn/python", "duration": "4 weeks"},
        {"resource": "Automate the Boring Stuff - Free", "url": "https://automatetheboringstuff.com", "duration": "3 weeks"},
    ],
    "SQL": [
        {"resource": "SQLZoo - Free Interactive", "url": "https://sqlzoo.net", "duration": "2 weeks"},
        {"resource": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial", "duration": "1 week"},
    ],
    "React": [
        {"resource": "React Official Docs", "url": "https://react.dev", "duration": "3 weeks"},
        {"resource": "Scrimba React Course", "url": "https://scrimba.com/learn/learnreact", "duration": "4 weeks"},
    ],
    "ML": [
        {"resource": "Fast.ai Deep Learning", "url": "https://fast.ai", "duration": "8 weeks"},
        {"resource": "Kaggle ML Courses - Free", "url": "https://kaggle.com/learn", "duration": "3 weeks"},
    ],
    "Docker": [
        {"resource": "Docker Getting Started", "url": "https://docs.docker.com/get-started", "duration": "1 week"},
        {"resource": "Docker & Kubernetes - Udemy", "url": "https://udemy.com", "duration": "3 weeks"},
    ],
    "AWS": [
        {"resource": "AWS Free Tier + Tutorials", "url": "https://aws.amazon.com/getting-started", "duration": "4 weeks"},
        {"resource": "Cloud Practitioner Essentials", "url": "https://aws.amazon.com/training", "duration": "6 weeks"},
    ],
    "Communication": [
        {"resource": "Toastmasters International", "url": "https://toastmasters.org", "duration": "Ongoing"},
        {"resource": "Coursera - Business Communication", "url": "https://coursera.org", "duration": "2 weeks"},
    ],
}

DEFAULT_PATH = [
    {"resource": "Google Search + YouTube", "url": "https://youtube.com", "duration": "1–2 weeks"},
    {"resource": "freeCodeCamp", "url": "https://freecodecamp.org", "duration": "2–4 weeks"},
]

class SkillGapRequest(BaseModel):
    user_skills: List[str]
    job_id: Optional[str] = None
    job_skills: Optional[List[str]] = None

@router.post("/skill-gap")
def skill_gap(request: SkillGapRequest):
    # Resolve job skills
    job_skills = request.job_skills or []
    job_title = "Selected Job"

    if request.job_id:
        job = next((j for j in JOBS if j["id"] == request.job_id), None)
        if job:
            job_skills = job["skills"]
            job_title = job["title"]

    matched = get_matching_skills(request.user_skills, job_skills)
    missing = get_missing_skills(request.user_skills, job_skills)

    match_percentage = round(len(matched) / max(len(job_skills), 1) * 100, 1)

    # Build learning paths for missing skills
    paths = {}
    for skill in missing:
        paths[skill] = LEARNING_PATHS.get(skill, DEFAULT_PATH)

    return {
        "job_title": job_title,
        "user_skills": request.user_skills,
        "required_skills": job_skills,
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percentage,
        "learning_paths": paths,
    }
