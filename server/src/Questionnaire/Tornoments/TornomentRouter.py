

'''
model Tornoment {
  id        Int     @id @default(autoincrement())
  Questionnaire Questionnaire @relation(fields: [Questionnaire_id], references: [id])
  Questionnaire_id Int

  tournamentsAsGuest GustInTornoment[]
}

model GustInTornoment {
  tornoment_id Int  
  tornoment Tornoment @relation(fields: [tornoment_id], references: [id])
  user_email String
  user User @relation(fields: [user_email], references: [email])
  init_time DateTime @default(now())
  start_time DateTime?
  @@id([tornoment_id, user_email])
}
'''

from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma
from pydantic import BaseModel
from datetime import datetime, timedelta

from src.Auth.auth import TokenModel, token_auth


class TornomentCreateModel(BaseModel):
    guests: list[str]
    Questionnaire_id: int


router = APIRouter()

@router.post('/create')
def create_tornoment(data: TornomentCreateModel, ):
    try: 
        now = datetime.now()
        minutes_3 = now + timedelta(minutes=3)
        db = Prisma()
        # import pdb; pdb.set_trace()
        db.connect()
        tornoment = db.tornoment.create(data={"Questionnaire_id": data.Questionnaire_id, 'start_time': minutes_3})
        for guest in data.guests:
            db.gustintornoment.create(data={"tornoment_id": tornoment.id, 'user_email': guest, })
        db.disconnect()
        return tornoment
    except Exception as e:
        print(e)
        return HTTPException(status_code=400, detail="details as not valid")
    


@router.get('/get_guests/')
def get_guests():
    db = Prisma()
    db.connect()
    guests = db.user.find_many()
    db.disconnect()
    emails = []

    for guest in guests:
        emails.append(guest.email)
    return emails
    # return guests


@router.get('/get_all_questions/{id}/{tor_id}')
def get_all_questions(id: int, tor_id: int,  token: TokenModel = Depends(token_auth)):
    db = Prisma()
    db.connect()
    questions = db.question.find_many( where={'Questionnaire_id': id}   )
    # for each question get the answers
    for question in questions:
        answers = db.answer.find_many(where={'question_id': question.id})
        question.answers = answers
        # get all the answer for this question for this user
        token.user_email
        answer_for_user = db.answertoquestionintor.find_first(
            where={'question_id': question.id, 'user_email': token.user_email, 'tornoment_id': tor_id}
            )
        print(answer_for_user)
        question.answerToQuestionInTor = answer_for_user
    db.disconnect()
    return questions