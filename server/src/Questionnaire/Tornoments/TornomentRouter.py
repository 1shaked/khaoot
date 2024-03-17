

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

from fastapi import APIRouter, HTTPException
from prisma import Prisma
from pydantic import BaseModel
from datetime import datetime, timedelta


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
