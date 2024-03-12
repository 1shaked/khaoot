from pydantic import BaseModel

'''model Question {
  id        Int     @id @default(autoincrement())
  Questionnaire Questionnaire @relation(fields: [Questionnaire_id], references: [id])
  Questionnaire_id Int
  title     String
  points    Int @default(50)
  question_time Int @default(10)
  answers Answer[]

}'''

class QuestionCreateModel(BaseModel):
    title: str
    points: int | None
    question_time: int | None
    Questionnaire_id: int

class QuestionDeleteModel(QuestionCreateModel):
    id: int