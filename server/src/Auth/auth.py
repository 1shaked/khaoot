from prisma import Prisma
from pydantic import BaseModel
from fastapi import APIRouter
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
    return pwdhash.hex(), salt

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
    user_json['password'] = hashed_password
    print("user_json", user_json, salt)
    user_db = await db.user.create(data=user_json)
    await db.disconnect()
    return user_db


@router.post("/auth/login")
async def login(user: UserModel):
    return user

@router.post("/auth/logout")
async def logout(token: TokenModel):
    return token
