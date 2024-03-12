from prisma import Prisma
from pydantic import BaseModel
from fastapi import APIRouter
from fastapi import FastAPI, Request, HTTPException, Depends
import hashlib
import os



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


@router.post("/signup")
async def signup(user: UserModel):
    try:
        db = Prisma()
        db.connect()    
        user_json = user.model_dump()
        # modify the password to be hashed
        # ps.hash_password(user_json)
        hashed_password, salt = hash_password(user_json['password'])
        # import pdb; pdb.set_trace()
        user_json['password'] = hashed_password
        user_json['salt'] = salt
        print("user_json", user_json, salt)
        user_db = db.user.create(data=user_json)
        #  generate a token for the user
        user_db = user_db.model_dump()
        token = db.token.create(data={"user_email": user_db['email']})
        db.disconnect()
        return token
    except Exception as e:
        print("error", e)
        return HTTPException(status_code=400, detail="Invalid credentials")


@router.post("/login")
async def login(user: UserModel):
    # take the user email and password
    
    # find the user in the db
    db = Prisma()
    db.connect()
    import pdb; pdb.set_trace()

    db_user = db.user.find_unique(where={"email": user.email})
    db.disconnect()
    db_user = db_user.model_dump()
    # compare the password with the hashed password
    is_login = verify_password(db_user['password'], bytes.fromhex(db_user['salt']), user.password)
    # if login create a new token
    if (is_login): 
        db.connect()
        db_user = db.token.find_unique(where={"user_email": user.email})
        if db_user:
            # delete the old token
            db.token.delete(where={"user_email": user.email})
        token = db.token.create(data={"user_email": user.email})        
        # db.token.update_or_create(data={"token": "123", "user_email": user.email})
        db.disconnect()
        token = token.model_dump()
        token['email'] = token['user_email']
        return token
    return HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout")
async def logout(token: TokenModel):

    db = Prisma()
    db.connect()
    db_token = db.token.delete(where={"token": token.token, "user_email": token.user_email})
    db.disconnect()
    return { 'status': 'success', 'message': 'logged out successfully' }


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
    

