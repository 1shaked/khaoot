from pydantic import BaseModel



'''
  user      User    @relation(fields: [user_email], references: [email])
  user_email String @unique
  id        Int     @id @default(autoincrement())
  title    String
'''
class QuestionnaireCreateModel(BaseModel):
    title: str


class QuestionnaireDeleteModel(BaseModel):
    id: int


class QuestionnaireGetModel(BaseModel):
    id: int
