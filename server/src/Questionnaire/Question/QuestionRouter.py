

from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma

from src.Auth.auth import TokenModel, token_auth
from src.Questionnaire.Question.Question import QuestionCreateAnswersModel, QuestionCreateModel, QuestionsCreateListModal


router = APIRouter()


@router.post('/create')
def create_questions(question: QuestionCreateModel, ):
    try: 
        db = Prisma()
        # import pdb; pdb.set_trace()

        db.connect()
        question = db.question.create(data=question.model_dump())
        db.disconnect()
        return question
    except Exception as e:
        print(e)
        return HTTPException(status_code=400, detail="details as not valid")
    


@router.post('/answers/{id}/create/')
def create_questions(id: int, questions: QuestionCreateAnswersModel, ):
    db = Prisma()
    db.connect()
    import pdb; pdb.set_trace()
    
    try:
        db.answer.delete_many(where={"question_id": id}) 
        for question in questions.answers:
            question['Questionnaire_id'] = id
            db.answer.create(data={'is_correct': question.is_correct, 'title': question.answer, 'question_id': id})
        db.disconnect()
        return {"message": "answers created"}
    except Exception as e:
        print(e)
        db.disconnect()
        return HTTPException(status_code=400, detail="details as not valid")