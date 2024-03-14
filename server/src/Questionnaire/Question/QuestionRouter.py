

from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma

from src.Auth.auth import TokenModel, token_auth
from src.Questionnaire.Question.Question import QuestionCreateModel, QuestionsCreateListModal


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
    

