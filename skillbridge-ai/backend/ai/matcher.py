from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
from typing import List, Dict, Any


def tokenize_skills(skills: List[str]) -> str:
    """Convert a list of skills into a tokenized string for TF-IDF."""
    return " ".join(s.lower().replace(" ", "_").replace(".", "") for s in skills)


def compute_match_score(user_skills: List[str], job_skills: List[str]) -> float:
    """Compute TF-IDF cosine similarity between user and job skills."""
    user_text = tokenize_skills(user_skills)
    job_text = tokenize_skills(job_skills)

    if not user_text.strip() or not job_text.strip():
        return 0.0

    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([user_text, job_text])
        score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(float(score) * 100, 1)
    except Exception:
        return 0.0


def get_matching_skills(user_skills: List[str], job_skills: List[str]) -> List[str]:
    """Return skills that appear in both user profile and job requirements."""
    user_set = {s.lower().strip() for s in user_skills}
    job_set = {s.lower().strip() for s in job_skills}
    matched = user_set & job_set
    # Return in original casing from job_skills
    return [s for s in job_skills if s.lower().strip() in matched]


def get_missing_skills(user_skills: List[str], job_skills: List[str]) -> List[str]:
    """Return skills required by job but missing from user profile."""
    user_set = {s.lower().strip() for s in user_skills}
    return [s for s in job_skills if s.lower().strip() not in user_set]


def match_jobs(user_profile: Dict[str, Any], jobs: List[Dict]) -> List[Dict]:
    """Match user profile against all jobs, return sorted results with scores."""
    user_skills = user_profile.get("skills", [])
    user_experience = user_profile.get("experience", 0)
    user_domain = user_profile.get("domain", "").lower()

    results = []
    for job in jobs:
        job_skills = job.get("skills", [])
        base_score = compute_match_score(user_skills, job_skills)

        # Domain boost
        domain_boost = 0.0
        if user_domain and user_domain in job.get("domain", "").lower():
            domain_boost = 8.0

        # Experience boost (slight)
        exp_boost = min(user_experience * 0.5, 5.0)

        final_score = min(round(base_score + domain_boost + exp_boost, 1), 99.0)

        matched = get_matching_skills(user_skills, job_skills)
        missing = get_missing_skills(user_skills, job_skills)

        # Build match reason
        if matched:
            reason = f"Matched because of: {', '.join(matched[:3])}"
        else:
            reason = "Adjacent role — consider upskilling"

        results.append({
            **job,
            "match_score": final_score,
            "matched_skills": matched,
            "missing_skills": missing[:4],
            "match_reason": reason,
        })

    # Sort by match score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


def extract_skills_from_text(text: str, skill_taxonomy: Dict) -> List[str]:
    """Extract known skills from raw text using keyword matching."""
    text_lower = text.lower()
    extracted = []
    skill_list = set()
    for domain_skills in skill_taxonomy.values():
        skill_list.update(skill_list_item.lower() for skill_list_item in domain_skills)

    words = re.findall(r"[\w\.\+#]+", text_lower)
    for word in words:
        if word in skill_list:
            # Return in proper casing
            for domain_skills in skill_taxonomy.values():
                for s in domain_skills:
                    if s.lower() == word and s not in extracted:
                        extracted.append(s)
    return extracted


def suggest_adjacent_roles(user_skills: List[str], all_jobs: List[Dict], top_match_score: float) -> List[str]:
    """Suggest roles the user could grow into."""
    suggestions = []
    for job in all_jobs:
        job_skills = job.get("skills", [])
        score = compute_match_score(user_skills, job_skills)
        if 20 <= score < top_match_score - 10:
            suggestions.append(job["title"])
        if len(suggestions) >= 3:
            break
    return suggestions
