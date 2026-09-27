from django.contrib import admin
from .models import Meeting, Transcript, Summary

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('id', 'user_id', 'title')

@admin.register(Transcript)
class TranscriptAdmin(admin.ModelAdmin):
    list_display = ('id', 'meeting')

@admin.register(Summary)
class SummaryAdmin(admin.ModelAdmin):
    list_display = ('id', 'meeting', 'generated_at')
