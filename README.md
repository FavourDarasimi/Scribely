# Scribely

Scribely helps teams automate their meeting notes and transcriptions. It takes audio recordings from meetings, identifies individual speakers, and produces a complete transcript alongside actionable summaries. No complicated login flows are required, allowing users to simply upload their files and get immediate, searchable results.

## Installation

Follow these steps to run the project locally. You will need Python, Node.js, and a running instance of Redis for the background task processing.

Clone the Repository:

```bash
git clone https://github.com/FavourDarasimi/Scribely.git
cd Scribely
```

### Backend Setup

Navigate to the backend directory, set up your virtual environment, and install the required dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Apply the database migrations and start the Django development server:

```bash
python manage.py migrate
python manage.py runserver
```

Open a new terminal window to start the Celery worker, which handles the audio transcription in the background:

```bash
cd backend
source venv/bin/activate
celery -A config worker -l info
```

Ensure you have your environment variables set up, particularly the Gladia API key required for transcription services. Create a `.env` file in the backend directory and add the key:

```env
GLADIA_API_KEY=your_api_key_here
```

### Frontend Setup

Open another terminal window, navigate to the frontend directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000, and it is pre-configured to proxy API requests to the Django backend running on port 8000.

## Usage

Scribely is designed for a frictionless user experience directly in the browser. 

1. Open your browser and navigate to the local frontend address.
2. Click the "Upload recording" button to access the recording interface.
3. You can choose to record audio directly from your browser using the microphone interface, or upload a pre-recorded audio file.
4. Once the audio is captured or uploaded, provide a name for the meeting and submit it.
5. The application will securely process the audio in the background. You can monitor the transmission status on the dashboard.
6. When processing is complete, click on the meeting entry to view the full, speaker-diarized transcript and AI-generated action items.

The application automatically identifies your browser session using a local storage identifier, ensuring your meeting logs remain accessible to you on return visits without requiring a traditional login.

## Features

* **Automated Transcription**: Converts meeting audio into highly accurate text automatically.
* **Speaker Diarization**: Intelligently identifies and labels different speakers throughout the conversation.
* **Intelligent Summarization**: Extracts key action items and generates concise summaries of the discussion points.
* **Frictionless Access**: Utilizes browser-based identification to manage user sessions, eliminating the need for complex authentication hurdles.
* **Asynchronous Processing**: Handles large audio files and transcription tasks in the background using Celery, keeping the web interface highly responsive.
* **Modern Interface**: Features a clean, animated frontend with real-time status updates on transcription progress.

## Technologies Used

| Category | Technologies |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Python, Django, Django REST Framework, Celery |
| Data & Caching | SQLite (Development), Redis |
| External APIs | Gladia API |

## Contributing

Contributions are welcome. If you would like to improve Scribely, please fork the repository and submit a pull request with your changes. Be sure to test your code locally before submitting to ensure both the frontend and backend components function correctly together.

## Author Info

* X (Twitter): https://x.com/code_with_dara

## Built With

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Celery](https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white)](https://docs.celeryq.dev/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://dokugen.samueltuoyo.com)