from prisma import Prisma
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException

from src.Questionnaire.QuestionnaireCreate import QuestionnaireCreateModel
from src.Auth.auth import TokenModel, token_auth


router = APIRouter()

@router.get("/list")
async def questionnaire_list(token: TokenModel = Depends(token_auth)):
    db = Prisma()
    db.connect()
    # import pdb; pdb.set_trace()
    questionnaires = db.questionnaire.find_many(
        where={"user_email": token.user_email},
        include={
            'questions': False,
            'tornoments': False,
            'user': False,
            # 'title': True,
         }
        # include=['user_email', 'title']
        )

    return questionnaires


@router.post('/create')
async def create_questionnaire(data: QuestionnaireCreateModel, token: TokenModel = Depends(token_auth)):
    try: 
        db = Prisma()
        # import pdb; pdb.set_trace()

        db.connect()
        questionnaire = db.questionnaire.create(data={"title": data.title, "user_email": token.user_email})

        db.disconnect()
        return questionnaire
    except Exception as e:
        print(e)
        return HTTPException(status_code=400, detail="details as not valid")
    
# token: TokenModel = Depends(token_auth)
@router.get('/{id}')
def get_question(id: int, ):
    db = Prisma()
    db.connect()
    questions = db.question.find_many( where={'Questionnaire_id': id}   )
    tornoments  = db.tornoment.find_many(where={ 'Questionnaire_id' : id} )
    questionnaire = db.questionnaire.find_unique(where={'id': id})
    # import pdb; pdb.set_trace()
    db.disconnect()
    return {'questions': questions, 'tornoments': tornoments, 'title': questionnaire.title,}

