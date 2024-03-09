from pydantic import BaseModel
from fastapi import APIRouter

"""
model User {
  email String  @unique @id
  password String
  tokens Token[]
}

model Token {
  token     String @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User    @relation(fields: [user_email], references: [email])
  user_email String @unique
}
"""
class UserModel(BaseModel):
    password: str
    email: str

class TokenModel(BaseModel):
    token: str
    user_email: str
    user: UserModel
    createdAt: str
    updatedAt: str


router = APIRouter()


@router.post("/auth/signup")
async def signup(user: UserModel):
    return user


@router.post("/auth/login")
async def login(user: UserModel):
    return user

@router.post("/auth/logout")
async def logout(token: TokenModel):
    return token
