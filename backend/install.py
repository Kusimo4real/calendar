import os.path

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar"]


def main():
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            service = build('calendar', 'v3', credentials=creds)
            calendar_list = service.calendarList().list().execute()
            for calendar in calendar_list['items']:
                print(f"Calendar ID: {calendar['id']}, Summary: {calendar['summary']}")
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    else:
        service = build('calendar', 'v3', credentials=creds)
        calendar_list = service.calendarList().list().execute()
        for calendar in calendar_list['items']:
            print(f"Calendar ID: {calendar['id']}, Summary: {calendar['summary']}")


if __name__ == "__main__":
    main()
