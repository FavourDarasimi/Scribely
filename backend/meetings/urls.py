from django.urls import path
from . import views

urlpatterns = [
    path('', views.MeetingListCreateView.as_view(), name='meeting-list-create'),
    path('<uuid:pk>/', views.MeetingDetailView.as_view(), name='meeting-detail'),
    path('<uuid:pk>/retry/', views.MeetingRetryView.as_view(), name='meeting-retry'),
]
