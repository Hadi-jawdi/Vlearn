from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .models import Room
import uuid

def home(request):
    return render(request, 'mettings_app/home.html')

def create_room(request):
    if request.method == 'POST':
        room_name = request.POST.get('room_name')
        if room_name:
            room = Room.objects.create(name=room_name)
            return redirect('room', room_code=room.code)
    return redirect('home')

def join_room(request):
    if request.method == 'POST':
        room_code = request.POST.get('room_code')
        try:
            room = Room.objects.get(code=room_code)
            return redirect('room', room_code=room.code)
        except Room.DoesNotExist:
            return HttpResponse("Room not found", status=404)
    return redirect('home')

def room(request, room_code):
    room = get_object_or_404(Room, code=room_code)
    return render(request, 'mettings_app/room.html', {'room': room})
