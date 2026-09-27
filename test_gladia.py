import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from meetings.services.gladia import submit_audio_to_gladia

try:
    job_id = submit_audio_to_gladia('backend/media/recordings/recording.webm')
    print("Success! Job ID:", job_id)
except Exception as e:
    print("Failed!", e)
