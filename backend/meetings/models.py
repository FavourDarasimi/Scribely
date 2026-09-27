from django.db import models
import uuid

class Meeting(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True) # NOT a ForeignKey
    title = models.CharField(max_length=255, blank=True)
    audio_file = models.FileField(upload_to="recordings/")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    gladia_job_id = models.CharField(max_length=255, null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title or 'Untitled'} ({self.id})"

class Transcript(models.Model):
    meeting = models.OneToOneField(Meeting, on_delete=models.CASCADE, related_name="transcript")
    raw_response = models.JSONField(null=True, blank=True)
    full_text = models.TextField()
    speakers = models.JSONField() # list of segments: speaker label, start, end, text

    def __str__(self):
        return f"Transcript for {self.meeting.id}"

class Summary(models.Model):
    meeting = models.OneToOneField(Meeting, on_delete=models.CASCADE, related_name="summary")
    summary_text = models.TextField()
    action_items = models.JSONField() # list of strings
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Summary for {self.meeting.id}"
