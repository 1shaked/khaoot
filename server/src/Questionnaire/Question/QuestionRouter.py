

from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma

from src.Auth.auth import TokenModel, token_auth
from src.Questionnaire.Question.Question import QuestionsCreateListModal


router = APIRouter()


@router.post('/create')
def create_question(questions: QuestionsCreateListModal, token: TokenModel = Depends(token_auth)):
    try: 
        db = Prisma()
        # import pdb; pdb.set_trace()

        db.connect()
        question = db.question.create_many(data=questions.questions)
        db.disconnect()
        return question
    except Exception as e:
        print(e)
        return HTTPException(status_code=400, detail="details as not valid")
    

