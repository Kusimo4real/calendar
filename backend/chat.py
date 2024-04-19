from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
import uuid
import json
from util import r, openai, get_events_for_date
from db import database, Request
import datetime

chat_router = APIRouter()


class ReplyRequest(BaseModel):
    reply: str


@chat_router.get("/create_session")
def create_session():
    system_prompt = "system: Today is " + datetime.date.today().strftime("%Y-%m-%d") + """, you are a virtual secretary for a boss and you are talking the the guests. Guests will ask you when the boss is available and request the boss's schedule. If a guest asks when the boss is available on a specific day, please respond with a "When-Available" event, and I will provide the boss's schedule for you to analyze and advise the guest. If a guest requests to book a specific time from the boss, please respond with a "Time-Request" event, and I will save the guest's request. If your response is not an event, please reply normally. If your response is an event, the response should be in JSON format, and you should ONLY reply the JSON, as following: \n{"type": "When-Available", "date": "2024-02-25"} \n{"type": "Time-Request", "date": "2024-02-25", "event": "Play basketball"} \nWhen a visitor requests to schedule time with the boss on a specific day, please refrain from asking unnecessary questions and simply respond with "Time-Request" event. Now, please greet the user and ask what they need.\nsecretary:"""

    response = openai.Completion.create(
        engine="gpt-3.5-turbo-instruct",
        prompt=system_prompt,
        max_tokens=3000
    )

    session_id = str(uuid.uuid4())
    conversation = [
        {'role': 'system', 'content': system_prompt},
        {'role': 'secretary', 'content': response.choices[0].text.strip()},
    ]
    r.set(session_id, json.dumps(conversation))

    return {
        'session_id': session_id,
        'response': response.choices[0].text.strip()
    }


@chat_router.post("/reply/{session_id}")
def reply(session_id: str, request: ReplyRequest):
    conversation = r.get(session_id)

    if conversation is None:
        raise HTTPException(status_code=404, detail="Session not found")

    conversation = json.loads(conversation)
    conversation.append({'role': 'guest', 'content': request.reply})

    response = openai.Completion.create(
        engine="gpt-3.5-turbo-instruct",
        prompt='\n'.join([item['role'] + ': ' + item['content'] for item in conversation]) + '\nsecretary:',
        max_tokens=3000
    )
    reply = response.choices[0].text.strip()
    try:
        reply = json.loads(reply)
        print(reply)
        if reply['type'] == 'When-Available':
            events = get_events_for_date(reply["date"])
            if events == '':
                content = f'''The boss is free all day in this day. Please reply to the guest in human language with these information.'''
            else:
                content = f'''In this day the boss' schedule is listed below, at these time the boss is not available: {events}Please reply to the guest in human language with these information.'''
            conversation.append({'role': 'system', 'content': content})
        elif reply['type'] == 'Time-Request':
            database.add(Request(
                date=reply['date'],
                event=reply['event']
            ))
            database.commit()
            conversation.append({'role': 'system', 'content': 'Please tell the quest that the request has been recorded and will be shown to the boss. Do not ask any more questions. Reply in human language.'})
        else:
            raise ValueError()
        response = openai.Completion.create(
            engine="gpt-3.5-turbo-instruct",
            prompt='\n'.join([item['role'] + ': ' + item['content'] for item in conversation]) + '\nsecretary:',
            max_tokens=3000
        )
        reply = response.choices[0].text.strip()
    except:
        pass
    conversation.append({'role': 'secretary', 'content': reply})
    r.set(session_id, json.dumps(conversation))

    return {
        'response': reply
    }
