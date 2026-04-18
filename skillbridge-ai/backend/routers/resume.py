from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from data.data_store import EXPERIENCE_CONVERSIONS, SKILL_TAXONOMY
from ai.matcher import extract_skills_from_text

router = APIRouter()

class ResumeRequest(BaseModel):
    name: str
    email: str
    phone: str
    location: str
    summary: str = ""
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    certifications: List[str] = []

class ExtractSkillsRequest(BaseModel):
    text: str

@router.post("/generate-resume")
def generate_resume(request: ResumeRequest):
    data = request.dict()

    # Auto-generate summary if empty
    if not data["summary"] and data["skills"]:
        top_skills = ", ".join(data["skills"][:4])
        years = sum(
            int(str(exp.get("duration", "0")).split()[0])
            for exp in data["experience"]
            if exp.get("duration")
        ) if data["experience"] else 0
        data["summary"] = (
            f"Results-driven professional with {years}+ years of experience "
            f"specializing in {top_skills}. "
            f"Passionate about delivering high-quality solutions and continuous learning."
        )

    # Convert informal experiences
    for exp in data["experience"]:
        title = exp.get("title", "").lower()
        for keyword, converted_skills in EXPERIENCE_CONVERSIONS.items():
            if keyword in title and "converted_skills" not in exp:
                exp["converted_skills"] = converted_skills

    return {
        "resume": data,
        "ats_score": _estimate_ats_score(data),
        "suggestions": _get_resume_suggestions(data),
    }

@router.post("/extract-skills")
def extract_skills(request: ExtractSkillsRequest):
    extracted = extract_skills_from_text(request.text, SKILL_TAXONOMY)
    
    # Also check experience conversions
    text_lower = request.text.lower()
    converted = []
    for keyword, skills in EXPERIENCE_CONVERSIONS.items():
        if keyword in text_lower:
            converted.extend(skills)
    
    return {
        "extracted_skills": extracted,
        "converted_from_experience": list(set(converted)),
        "all_skills": list(set(extracted + converted)),
    }

def _estimate_ats_score(resume: dict) -> int:
    score = 40
    if resume.get("skills"): score += 20
    if resume.get("experience"): score += 15
    if resume.get("education"): score += 10
    if resume.get("projects"): score += 10
    if resume.get("certifications"): score += 5
    if len(resume.get("summary", "")) > 50: score += 5
    return min(score, 99)

def _get_resume_suggestions(resume: dict) -> List[str]:
    suggestions = []
    if len(resume.get("skills", [])) < 5:
        suggestions.append("Add at least 5–8 skills to improve ATS match rate.")
    if not resume.get("projects"):
        suggestions.append("Add 2–3 projects to showcase practical experience.")
    if not resume.get("certifications"):
        suggestions.append("Include relevant certifications (free Coursera/Google certs count!).")
    if len(resume.get("summary", "")) < 50:
        suggestions.append("Write a 2–3 sentence professional summary at the top.")
    if not suggestions:
        suggestions.append("Great resume! Your ATS score is high. Apply with confidence.")
    return suggestions
