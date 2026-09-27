from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Meeting
from .serializers import MeetingListSerializer, MeetingDetailSerializer, MeetingCreateSerializer
from .permissions import IsUserScoped
from .tasks import transcribe_meeting

class MeetingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsUserScoped]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MeetingCreateSerializer
        return MeetingListSerializer

    def get_queryset(self):
        return Meeting.objects.filter(user_id=self.request.user_id).order_by('-created_at')

    def perform_create(self, serializer):
        # Create meeting with user_id from the header (set by permission class)
        meeting = serializer.save(user_id=self.request.user_id, status='pending')
        
        # Trigger Celery task
        transcribe_meeting.delay(str(meeting.id))
        
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Return the created meeting with id and status
        # Using MeetingListSerializer for the response so it includes status and title
        response_serializer = MeetingListSerializer(serializer.instance)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class MeetingDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsUserScoped]
    serializer_class = MeetingDetailSerializer

    def get_queryset(self):
        return Meeting.objects.filter(user_id=self.request.user_id)
        
    def perform_destroy(self, instance):
        # The cascade deletion will handle Transcript and Summary.
        # Ensure the audio file is deleted from storage too.
        if instance.audio_file:
            instance.audio_file.delete(save=False)
        instance.delete()

class MeetingRetryView(APIView):
    permission_classes = [IsUserScoped]

    def post(self, request, pk):
        meeting = get_object_or_404(Meeting, pk=pk, user_id=request.user_id)
        if meeting.status != 'failed':
            return Response(
                {"detail": "Can only retry failed meetings."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        meeting.status = 'pending'
        meeting.error_message = None
        meeting.save(update_fields=['status', 'error_message'])
        
        # Re-trigger Celery task
        transcribe_meeting.delay(str(meeting.id))
        
        return Response({"status": "retry_initiated"})
