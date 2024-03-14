from typing import Union

from fastapi import FastAPI
from prisma import Prisma
from src.Auth import auth

from src.Questionnaire import Questionnaire
from src.Questionnaire.Question import QuestionRouter
from src.Questionnaire.Tornoments import TornomentRouter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


origins = [
    "*",
    "http://localhost:5173"

]


app.include_router(auth.router, prefix="/auth")
app.include_router(Questionnaire.router, prefix="/questionnaire")
app.include_router(QuestionRouter.router, prefix="/question")
app.include_router(TornomentRouter.router, prefix='/tornoment')
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def post_list():
    db = Prisma()
    db.connect()    
    posts = db.post.find_many()
    db.disconnect()
    print("posts", posts)
    return posts


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}