# SkillBridge AI — API Documentation

Base URL: `http://localhost:8000`

Interactive Swagger UI: `http://localhost:8000/docs`

---

## Authentication
No authentication required. All endpoints are open for local development.

---

## POST `/api/match-jobs`

Match a user profile against all available jobs using TF-IDF + cosine similarity.

**Request Body:**
```json
{
  "name": "Arjun Sharma",
  "skills": ["Python", "FastAPI", "SQL", "React"],
  "experience": 2,
  "domain": "Software Engineering",
  "location": "Hyderabad",
  "job_type": "Full-time"
}
```

**Response:**
```json
{
  "matches": [
    {
      "id": "j001",
      "title": "Python Backend Developer",
      "company": "TechNova Pvt Ltd",
      "location": "Hyderabad (Remote)",
      "salary": "₹6–10 LPA",
      "match_score": 87.4,
      "matched_skills": ["Python", "FastAPI"],
      "missing_skills": ["Docker", "PostgreSQL"],
      "match_reason": "Matched because of: Python, FastAPI"
    }
  ],
  "adjacent_roles": ["DevOps Engineer", "Data Engineer"],
  "total_jobs_scanned": 12
}
```

---

## GET `/api/jobs`

Get all available job listings.

---

## POST `/api/generate-resume`

Generate an ATS-friendly resume with auto-summary and ATS scoring.

**Request Body:**
```json
{
  "name": "Arjun Sharma",
  "email": "arjun@gmail.com",
  "phone": "+91 98765 43210",
  "location": "Hyderabad",
  "summary": "",
  "skills": ["Python", "FastAPI", "SQL"],
  "experience": [
    {
      "title": "Backend Developer",
      "company": "TechStart",
      "duration": "2 years",
      "location": "Hyderabad",
      "description": "Built REST APIs for fintech platform"
    }
  ],
  "education": [{"degree": "B.Tech CS", "institution": "JNTU", "year": "2022", "gpa": "8.2"}],
  "projects": [{"name": "AI Resume Analyzer", "tech": "Python, spaCy", "description": "..."}],
  "certifications": ["Google Data Analytics"]
}
```

**Response:**
```json
{
  "resume": { ... },
  "ats_score": 82,
  "suggestions": ["Add 2–3 projects to showcase practical experience"]
}
```

---

## POST `/api/extract-skills`

Extract professional skills from raw text (experience description).

**Request Body:**
```json
{ "text": "I worked in a bike shop repairing motorcycles and managing parts inventory" }
```

**Response:**
```json
{
  "extracted_skills": [],
  "converted_from_experience": ["Mechanical skills", "Inventory management", "Customer handling"],
  "all_skills": ["Mechanical skills", "Inventory management", "Customer handling"]
}
```

---

## POST `/api/skill-gap`

Compare user skills against a specific job's requirements.

**Request Body:**
```json
{
  "user_skills": ["Python", "SQL", "React"],
  "job_id": "j001"
}
```

**Response:**
```json
{
  "job_title": "Python Backend Developer",
  "matched_skills": ["Python"],
  "missing_skills": ["Docker", "PostgreSQL"],
  "match_percentage": 40.0,
  "learning_paths": {
    "Docker": [
      { "resource": "Docker Getting Started", "url": "https://docs.docker.com", "duration": "1 week" }
    ]
  }
}
```

---

## POST `/api/interview/question`

Get an interview question for the specified domain.

**Request Body:**
```json
{ "domain": "Software Engineering", "question_index": 0 }
```

**Response:**
```json
{
  "question": "Tell me about yourself and your programming background.",
  "question_number": 1,
  "total_questions": 8,
  "domain": "Software Engineering"
}
```

Supported domains: `General`, `Software Engineering`, `Data & Analytics`, `AI/ML`

---

## POST `/api/interview/improve`

Analyze and improve a user's interview answer.

**Request Body:**
```json
{
  "question": "Tell me about yourself",
  "user_answer": "I am a developer, I know Python and built some APIs",
  "personality": "friendly"
}
```

Personality modes: `friendly` | `strict` | `technical`

**Response:**
```json
{
  "improved_answer": "I am a motivated professional...",
  "feedback_message": "[Friendly HR 😊] Your answer was brief. Here's a polished version:",
  "scores": { "clarity": 45, "confidence": 85, "structure": 45 },
  "tips": ["📋 Use STAR method: Situation → Task → Action → Result."],
  "personality": "friendly"
}
```

---

## Health Check

`GET /health` → `{ "status": "ok" }`
