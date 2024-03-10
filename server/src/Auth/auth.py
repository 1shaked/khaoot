from prisma import Prisma
from pydantic import BaseModel
from fastapi import APIRouter
from fastapi import FastAPI, Request, HTTPException, Depends

# import password as ps

class UserModel(BaseModel):
    password: str
    email: str

class TokenModel(BaseModel):
    token: str
    user_email: str
    user: UserModel
    createdAt: str
    updatedAt: str

import hashlib
import os

def hash_password(password: str) -> (str, bytes): # type: ignore
    """Hash a password with a salt."""
    # Generate a random salt
    salt = os.urandom(16)
    
    # Use the hashlib library to hash the password together with the salt
    # We're using sha256 in this example, but you can use other algorithms as well
    pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    
    # Return the hexadecimal representation of the hash along with the salt
    return pwdhash.hex(), salt.hex()

def verify_password(stored_password_hash: str, salt: bytes, provided_password: str) -> bool:
    """Verify a provided password against the stored hash and salt."""
    # Hash the provided password with the stored salt
    pwdhash = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)
    
    # Compare the hash of the provided password with the stored hash
    return pwdhash.hex() == stored_password_hash
router = APIRouter()


@router.post("/auth/signup")
async def signup(user: UserModel):
    db = Prisma()
    import pdb; pdb.set_trace()
    await db.connect()    
    user_json = user.model_dump()
    # modify the password to be hashed
    # ps.hash_password(user_json)
    hashed_password, salt = hash_password(user_json['password'])
    import pdb; pdb.set_trace()
    user_json['password'] = hashed_password
    user_json['salt'] = salt
    print("user_json", user_json, salt)
    user_db = await db.user.create(data=user_json)
    await db.disconnect()
    return user_db


@router.post("/auth/login")
async def login(user: UserModel):
    # take the user email and password
    
    # find the user in the db
    db = Prisma()
    await db.connect()
    db_user = await db.user.find_unique(where={"email": user.email})
    await db.disconnect()
    db_user = db_user.model_dump()
    print("db_user", db_user)
    # compare the password with the hashed password
    db_user['salt']
    is_login = verify_password(db_user['password'], bytes.fromhex(db_user['salt']), user.password)
    print(is_login)
    # if login create a new token
    if (is_login): 
        await db.connect()
        # db_user = await db.token.find_unique(where={"email": user.email})
        # db.token.update_or_create(data={"token": "123", "user_email": user.email})
        await db.disconnect()
    return user

@router.post("/auth/logout")
async def logout(token: TokenModel):
    return token


async def token_auth(request: Request):
    # Check if the token is present in the headers
    token = request.headers.get("Authorization")

    # If the token is not present, raise an HTTPException
    if not token:
        raise HTTPException(status_code=401, detail="Token is missing")

    # If the token is present, check if valid
    # if not valid, raise an HTTPException
    db = Prisma()
    await db.connect()
    db_token = await db.token.find_unique(where={"token": token})
    await db.disconnect()
    if not db_token:
        raise HTTPException(status_code=401, detail="Token is invalid")
    

