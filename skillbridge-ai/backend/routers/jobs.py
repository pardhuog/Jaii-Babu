from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from ai.matcher import match_jobs, suggest_adjacent_roles
from data.data_store import JOBS

router = APIRouter()

class UserProfile(BaseModel):
    name: str = ""
    skills: List[str] = []
    experience: int = 0  # years
    domain: str = ""
    location: str = ""
    job_type: str = ""  # "Full-time" | "Remote" | "Contract"

@router.post("/match-jobs")
def match_jobs_endpoint(profile: UserProfile):
    matched = match_jobs(profile.dict(), JOBS)
    top_score = matched[0]["match_score"] if matched else 0

    # Adjacent roles from lower-scoring matches
    adjacent = []
    for job in matched[5:]:
        if job["match_score"] < top_score - 10:
            adjacent.append(job["title"])
        if len(adjacent) >= 3:
            break

    return {
        "matches": matched[:8],
        "adjacent_roles": adjacent,
        "total_jobs_scanned": len(JOBS),
    }

@router.get("/jobs")
def get_all_jobs():
    return {"jobs": JOBS}
