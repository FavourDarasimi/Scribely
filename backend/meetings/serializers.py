from rest_framework import serializers
from .models import Meeting, Transcript, Summary

class TranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transcript
        fields = ['full_text', 'speakers']

class SummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Summary
        fields = ['summary_text', 'action_items', 'generated_at']

class MeetingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['id', 'title', 'status', 'created_at']

class MeetingDetailSerializer(serializers.ModelSerializer):
    transcript = TranscriptSerializer(read_only=True)
    summary = SummarySerializer(read_only=True)

    class Meta:
        model = Meeting
        fields = ['id', 'title', 'audio_file', 'status', 'error_message', 'created_at', 'updated_at', 'transcript', 'summary']

class MeetingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['title', 'audio_file']
