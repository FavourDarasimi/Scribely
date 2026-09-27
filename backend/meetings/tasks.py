from celery import shared_task
import logging
from .models import Meeting, Transcript
from .services.gladia import submit_audio_to_gladia, poll_gladia_result, parse_gladia_transcript

logger = logging.getLogger(__name__)

@shared_task
def transcribe_meeting(meeting_id):
    try:
        meeting = Meeting.objects.get(id=meeting_id)
    except Meeting.DoesNotExist:
        logger.error(f"Meeting {meeting_id} not found.")
        return
        
    meeting.status = 'processing'
    meeting.save(update_fields=['status'])
    
    try:
        # Submit audio
        if not meeting.audio_file:
            raise ValueError("Meeting has no audio file.")
            
        file_path = meeting.audio_file.path
        job_id = submit_audio_to_gladia(file_path)
        
        meeting.gladia_job_id = job_id
        meeting.save(update_fields=['gladia_job_id'])
        
        # Poll for completion
        raw_response = poll_gladia_result(job_id)
        
        # Parse results
        full_text, speakers = parse_gladia_transcript(raw_response)
        
        # Save Transcript
        Transcript.objects.create(
            meeting=meeting,
            raw_response=raw_response,
            full_text=full_text,
            speakers=speakers
        )
        
        # TODO: Implement LLM summary generation and create Summary object here
        
        # Update meeting status
        meeting.status = 'completed'
        meeting.save(update_fields=['status'])
        
    except Exception as e:
        logger.exception(f"Error processing meeting {meeting_id}")
        meeting.status = 'failed'
        meeting.error_message = str(e)
        meeting.save(update_fields=['status', 'error_message'])
