# Virtual Secretary Project

This project consists of two sub-projects: web and backend. The web project is the frontend built with Next.js, and the backend project is the backend built with FastAPI.

## Running the Project

Before running the project, you will need to make some configurations.

### Web Configuration

1. Navigate to the `web` directory and rename the `.env.example` file to `.env.local`.
2. Edit the `.env.local` file and provide the following configurations:
    ```
    NEXT_PUBLIC_API_KEY= # Google Calendar API Key
    NEXT_PUBLIC_CALENDAR_ID= # Google Calendar ID
    NEXT_PUBLIC_BACKEND_PREFIX=http://127.0.0.1:8000
    ```

### Backend Configuration

1. Navigate to the `backend` directory and rename the `.env.example` file to `.env`.
2. Edit the `.env` file and provide the following configurations:
    ```
    OPENAI_API_KEY=
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_DB=1
    REDIS_PASSWORD=
    DATABASE_URL=sqlite:///./app.db
    USERNAME=test
    PASSWORD=test
    ```

### Google Calendar Authentication

Before running the backend, you need to run `python install.py` to configure Google Calendar authentication.

### Running the Projects

#### Web

To run the web project, navigate to the `web` directory and run the following command:
```
npm install
npm run dev
```
The web project will be accessible at `http://localhost:3000`.

#### Backend

To run the backend project, navigate to the `backend` directory and run the following command:
```
uvicorn main:app --reload
```

After running the backend, you can access the admin panel for the virtual secretary at `http://localhost:3000/admin`. The default username and password is `test` and `test`.

## About

This project aims to provide a virtual secretary interface and backend services for managing tasks, appointments, and other administrative functions. It uses Google Calendar API and OpenAI for intelligent assistance.