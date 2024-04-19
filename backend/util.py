import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(), verbose=True)
api_key = os.getenv('OPENAI_API_KEY')
redis_host = os.getenv('REDIS_HOST')
redis_port = int(os.getenv('REDIS_PORT'))
redis_db = int(os.getenv('REDIS_DB'))
redis_pwd = os.getenv('REDIS_PASSWORD')
database_url = os.getenv('DATABASE_URL')
username = os.getenv('USERNAME')
password = os.getenv('PASSWORD')

import openai

openai.api_key = api_key

import redis

r = redis.StrictRedis(host=redis_host, port=redis_port, db=redis_db, password=redis_pwd, decode_responses=True)

from googleapiclient.discovery import build
from datetime import datetime
from datetime import time as dtime
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request


def get_credentials():
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", ["https://www.googleapis.com/auth/calendar"])
        print(creds.expiry)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            print("Credentials not valid. Please run install.py to initialize credentials.")
            exit(0)
    return creds


def get_events_for_date(date_str):
    creds = get_credentials()
    date = datetime.strptime(date_str, "%Y-%m-%d").date()
    service = build('calendar', 'v3', credentials=creds)

    start_time = datetime.combine(date, dtime.min).isoformat() + 'Z'
    end_time = datetime.combine(date, dtime.max).isoformat() + 'Z'

    events_result = service.events().list(calendarId='primary', timeMin=start_time, timeMax=end_time,
                                          singleEvents=True, orderBy='startTime').execute()
    events = events_result.get('items', [])

    schedule = ''
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        end = event['end'].get('dateTime', event['end'].get('date'))
        summary = event['summary']
        schedule += f"{start.split('T')[1].split('-')[0]} - {end.split('T')[1].split('-')[0]} {summary}; "

    return schedule


def update_schedule(date_str, new_events):
    creds = get_credentials()
    service = build('calendar', 'v3', credentials=creds)
    result = service.calendarList().get(calendarId='primary').execute()
    timezone = result['timeZone']

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


def get_user_timezone():
    creds = get_credentials()
    service = build('calendar', 'v3', credentials=creds)
    settings = service.settings().list().execute()
    timezone = None
    for setting in settings.get('items', []):
        if setting['id'] == 'timezone':
            timezone = setting['value']
            break

    return timezone
