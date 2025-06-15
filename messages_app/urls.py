from django.urls import path
from . import views

app_name = 'messages_app'

urlpatterns = [
    path('', views.chat_view, name='chat_home'),
    path('<str:username>/', views.chat_view, name='chat_with_user'),
    path('send/', views.send_message, name='send_message'),
    path('messages/<str:username>/', views.get_messages, name='get_messages'),
]
