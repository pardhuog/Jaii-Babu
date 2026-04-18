import random
from typing import Dict, List, Any
from data.data_store import INTERVIEW_QUESTIONS, IMPROVED_ANSWER_TEMPLATES

WEAK_ANSWER_PHRASES = ["i don't know", "um", "uh", "not sure", "maybe", "kind of", "sort of"]

def get_question(domain: str, question_index: int) -> Dict[str, Any]:
    """Get interview question for the given domain and index."""
    questions = INTERVIEW_QUESTIONS.get(domain, INTERVIEW_QUESTIONS["General"])
    idx = question_index % len(questions)
    return {
        "question": questions[idx],
        "question_number": idx + 1,
        "total_questions": len(questions),
        "domain": domain,
    }


def analyze_answer(answer: str) -> Dict[str, Any]:
    """Analyze an answer for quality signals."""
    answer_lower = answer.lower()
    word_count = len(answer.split())
    
    # Clarity: based on word count and sentence structure
    clarity = min(100, max(20, word_count * 3))
    
    # Confidence: penalize weak phrases
    confidence = 100
    for phrase in WEAK_ANSWER_PHRASES:
        if phrase in answer_lower:
            confidence -= 15
    confidence = max(20, confidence)
    
    # Structure: look for structure keywords
    structure_keywords = ["first", "second", "finally", "because", "therefore", "example", "result", "impact"]
    structure_hits = sum(1 for kw in structure_keywords if kw in answer_lower)
    structure = min(100, 30 + structure_hits * 15)
    
    return {
        "clarity": clarity,
        "confidence": confidence,
        "structure": structure,
        "word_count": word_count,
    }


def improve_answer(question: str, user_answer: str, personality: str = "friendly") -> Dict[str, Any]:
    """Generate an improved version of the user's answer."""
    analysis = analyze_answer(user_answer)
    
    # Build improved answer (template-based)
    improved = _build_improved_answer(question, user_answer, analysis)
    
    template = IMPROVED_ANSWER_TEMPLATES.get(personality, IMPROVED_ANSWER_TEMPLATES["friendly"])
    feedback_message = template.format(improved=improved)
    
    # Tips based on what's low
    tips = []
    if analysis["clarity"] < 60:
        tips.append("💡 Be more specific — add concrete details or examples.")
    if analysis["confidence"] < 60:
        tips.append("💪 Avoid words like 'maybe', 'not sure' — speak with conviction.")
    if analysis["structure"] < 60:
        tips.append("📋 Use the STAR method: Situation → Task → Action → Result.")
    if not tips:
        tips.append("✅ Strong answer! Great job keeping it structured and confident.")
    
    return {
        "improved_answer": improved,
        "feedback_message": feedback_message,
        "scores": analysis,
        "tips": tips,
        "personality": personality,
    }


def _build_improved_answer(question: str, raw_answer: str, analysis: Dict) -> str:
    """Build a polished version of the answer."""
    q_lower = question.lower()
    
    # Detect question type and inject structure
    if "tell me about yourself" in q_lower:
        return (
            f"I am a motivated professional with hands-on experience in the domains relevant to this role. "
            f"{raw_answer.strip().rstrip('.')}. "
            f"I am passionate about continuous learning and delivering impactful results."
        )
    elif "greatest strength" in q_lower:
        return (
            f"My greatest strength is {raw_answer.strip().rstrip('.')}. "
            f"I have consistently demonstrated this in my work, leading to measurable improvements in team output and project quality."
        )
    elif "weakness" in q_lower:
        return (
            f"One area I am actively improving is {raw_answer.strip().rstrip('.')}. "
            f"To address this, I have been taking structured courses and applying these learnings in real projects."
        )
    elif "conflict" in q_lower or "team" in q_lower:
        return (
            f"In that situation, I first listened actively to understand all perspectives. "
            f"{raw_answer.strip().rstrip('.')}. "
            f"The outcome was a stronger team understanding and a successfully delivered project."
        )
    elif "why" in q_lower and "job" in q_lower:
        return (
            f"I am excited about this opportunity because it aligns perfectly with my skills and career goals. "
            f"{raw_answer.strip().rstrip('.')}. "
            f"I believe I can add immediate value while continuing to grow in this role."
        )
    else:
        # Generic improvement
        sentences = raw_answer.strip().split(".")
        improved_sentences = [s.strip().capitalize() for s in sentences if s.strip()]
        return (
            f"{'. '.join(improved_sentences)}. "
            f"This experience directly prepared me for the challenges of this role."
        )
