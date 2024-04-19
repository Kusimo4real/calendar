from fastapi import FastAPI
from dotenv import load_dotenv, find_dotenv
from fastapi.middleware.cors import CORSMiddleware

from chat import chat_router
from schedule import schedule_router
from user import user_router

load_dotenv(find_dotenv(), verbose=True)
app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return "Backend of virtual secretary"


app.include_router(chat_router, prefix="/chat", tags=["ChatBot"])
app.include_router(schedule_router, prefix="/schedule", tags=["ScheduleBot"])
app.include_router(user_router, prefix="/user", tags=["User"])
