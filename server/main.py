from typing import Union

from fastapi import FastAPI
from prisma import Prisma

app = FastAPI()


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