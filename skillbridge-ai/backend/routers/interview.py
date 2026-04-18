from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from ai.interview_ai import get_question, improve_answer

router = APIRouter()

class QuestionRequest(BaseModel):
    domain: str = "General"
    question_index: int = 0

class ImproveRequest(BaseModel):
    question: str
    user_answer: str
    personality: str = "friendly"  # "friendly" | "strict" | "technical"

@router.post("/interview/question")
def get_interview_question(request: QuestionRequest):
    return get_question(request.domain, request.question_index)

@router.post("/interview/improve")
def improve_interview_answer(request: ImproveRequest):
    return improve_answer(request.question, request.user_answer, request.personality)
