# Scribely

## What is Scribely
Scribely is a free, open Fireflies/Otter-style meeting transcription app.
A user uploads an audio recording of a meeting; the backend sends it to
the Gladia API for transcription with speaker diarization, then generates
a summary and action items from the transcript using an LLM. The user
gets back a searchable transcript (labeled by speaker) and a summary,
viewable in a simple web dashboard. There is no login system — each
browser is identified by a UUID stored in localStorage, which scopes
which meetings that browser can see. This is an identification key,
not a real security/auth boundary.

## Backend setup
1. Activate virtual environment and install requirements
2. Apply migrations: `python manage.py migrate`
3. Run the development server: `python manage.py runserver`
4. Start the Celery worker (required for transcription): `celery -A config worker -l info`
# Scribely
# Scribely
