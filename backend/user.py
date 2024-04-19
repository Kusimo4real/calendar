from fastapi import APIRouter, HTTPException
from util import username as u, password as p

user_router = APIRouter()


@user_router.get("/login")
def login(username: str, password: str):
    if username != u or password != p:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    return {"msg": "Login successful"}
