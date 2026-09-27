import os
import requests
import time
import logging

logger = logging.getLogger(__name__)

GLADIA_API_URL = "https://api.gladia.io/v2"

def get_gladia_api_key():
    return os.getenv("GLADIA_API_KEY")

def submit_audio_to_gladia(file_path):
    """
    Submits a file to Gladia's async pre-recorded transcription endpoint.
    Returns the job id (transcription id) if successful.
    Raises an exception if network failure or API error.
    """
    api_key = get_gladia_api_key()
    if not api_key:
        raise ValueError("GLADIA_API_KEY environment variable is not set")
        
    headers = {
        "x-gladia-key": api_key,
    }
    
    # Step 1: Upload the file
    upload_url = f"{GLADIA_API_URL}/upload"
    filename = os.path.basename(file_path)
    
    logger.info(f"Uploading file {filename} to Gladia")
    
    files = {'audio': (filename, open(file_path, 'rb'), 'video/webm')}
    response = requests.post(upload_url, headers=headers, files=files)
        
    if not response.ok:
        raise requests.RequestException(f"Failed to upload to Gladia: {response.status_code} {response.text}")
        
    upload_data = response.json()
    audio_url = upload_data.get("audio_url")
    if not audio_url:
        raise ValueError("No audio_url returned from Gladia upload")
        
    # Step 2: Request transcription with diarization
    transcription_url = f"{GLADIA_API_URL}/transcription"
    payload = {
        "audio_url": audio_url,
        "diarization": True
    }
    # x-gladia-key is already in headers
    headers["Content-Type"] = "application/json"
    
    response = requests.post(transcription_url, headers=headers, json=payload)
    if not response.ok:
        raise requests.RequestException(f"Failed to start transcription: {response.status_code} {response.text}")
        
    transcription_data = response.json()
    return transcription_data.get("id")

def poll_gladia_result(job_id, timeout=3600, poll_interval=10):
    """
    Polls Gladia for the job result.
    Returns the raw JSON response once completed.
    Raises exception on failure or timeout.
    """
    api_key = get_gladia_api_key()
    headers = {
        "x-gladia-key": api_key,
    }
    url = f"{GLADIA_API_URL}/transcription/{job_id}"
    
    start_time = time.time()
    
    while True:
        if time.time() - start_time > timeout:
            raise TimeoutError("Gladia transcription polling timed out")
            
        response = requests.get(url, headers=headers)
        if not response.ok:
            raise requests.RequestException(f"Failed to poll Gladia: {response.status_code} {response.text}")
            
        data = response.json()
        status = data.get("status")
        
        if status == "done":
            return data
        elif status == "error":
            raise ValueError(f"Gladia transcription failed: {data}")
            
        # still processing/queued
        time.sleep(poll_interval)

def parse_gladia_transcript(gladia_response):
    """
    Parses full text and diarized speaker segments into a uniform shape.
    """
    result = gladia_response.get("result", {})
    transcription = result.get("transcription", {})
    
    full_text = transcription.get("full_transcript", "")
    
    speakers_list = []
    utterances = transcription.get("utterances", [])
    
    for utterance in utterances:
        speaker = utterance.get("speaker", "Unknown")
        start = utterance.get("start")
        end = utterance.get("end")
        text = utterance.get("text", "")
        
        speakers_list.append({
            "speaker": f"Speaker {speaker}" if isinstance(speaker, int) or speaker.isdigit() else str(speaker),
            "start": start,
            "end": end,
            "text": text
        })
        
    return full_text, speakers_list
