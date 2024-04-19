from fastapi import APIRouter
import json
from util import openai, get_events_for_date, get_user_timezone, get_credentials
from db import database, Request
from pydantic import BaseModel
from datetime import datetime
from googleapiclient.discovery import build

schedule_router = APIRouter()


class SuggestionRequest(BaseModel):
    add_schedule: str

@schedule_router.get("/requests")
def get_requests():
    requests = database.query(Request).all()
    return [item.dict() for item in requests]


@schedule_router.post('/suggest/{date}')
def get_suggestions(date: str, request: SuggestionRequest):
    events = get_events_for_date(date)
    format = '[ {"start_time": "xx:xx:xx", "end_time": "xx:xx:xx", "event": "xxx", "importance": 32}, {"start_time": "xx:xx:xx", "end_time": "xx:xx:xx", "event": "xxx", "importance": 77}]'
    prompt = f"""Please only return one JSON. You are a time management assistant, and I have the following events on this day:
{events}
Now I want to insert the following schedule:
{request.add_schedule}
Please give the priority of these schedules (from 1 to 100), and the rearranged schedule after your modification, reply with a JSON array in the following format:
{format}
The time arrangement of the schedule does not necessarily need to be in priority order; I wake up at 8 o'clock and go to bed at 22 o'clock, and the time for waking up and going to bed should not be reflected in the schedule; all times are in 24-hour format; existing event times can be modified; only one array is needed, without any other JSON keys, Markdown tags, or unrelated content; there should be no items listed above; the time format is hh:mm:ss, and there should be no dates in the time."""
    reply = None
    for _ in range(3):
        try:
            response = openai.Completion.create(
                engine="gpt-3.5-turbo-instruct",
                prompt=prompt,
                max_tokens=3000
            )
            reply = response.choices[0].text.strip()
            print(reply)
            reply = json.loads(reply)
            break
        except:
            pass
    if reply is None:
        raise ValueError()
    return reply


class ScheduleRequest(BaseModel):
    date: str
    events: list
    ids: list


@schedule_router.post("/update_schedule")
async def update_schedule(request: ScheduleRequest):
    date_str = request.date
    new_events = request.events
    timezone = get_user_timezone()
    creds = get_credentials()

    service = build('calendar', 'v3', credentials=creds)
    date = datetime.strptime(date_str, '%Y-%m-%d').date()

    start_time = datetime.combine(date, datetime.min.time()).isoformat() + 'Z'
    end_time = datetime.combine(date, datetime.max.time()).isoformat() + 'Z'

    events_result = service.events().list(calendarId='primary', timeMin=start_time, timeMax=end_time,
                                          singleEvents=True, orderBy='startTime').execute()
    events = events_result.get('items', [])

    for event in events:
        service.events().delete(calendarId='primary', eventId=event['id']).execute()

    for new_event in new_events:
        start_time = datetime.combine(date, datetime.strptime(new_event['start_time'], '%H:%M:%S').time())
        end_time = datetime.combine(date, datetime.strptime(new_event['end_time'], '%H:%M:%S').time())
        event = {
            'summary': new_event['event'],
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': timezone,
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': timezone,
            },
        }
        service.events().insert(calendarId='primary', body=event).execute()

    for id in request.ids:
        query = database.query(Request).filter(Request.id == id).first()
        if query:
            query.approved = True
            database.commit()

    return {"message": "Success"}
