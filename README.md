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

## Frontend setup
# Scribely
# Scribely
