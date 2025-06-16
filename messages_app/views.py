from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponseBadRequest
from .models import Message
from django.views.decorators.csrf import csrf_exempt
import json
from django.db.models import Q

@login_required
def chat_view(request, username=None):
    users = User.objects.exclude(id=request.user.id)
    selected_user = None
    messages = []
    if username and username != request.user.username:
        try:
            selected_user = User.objects.get(username=username)
            messages = Message.objects.filter(
                Q(sender=request.user, receiver=selected_user) |
                Q(sender=selected_user, receiver=request.user)
            ).order_by('timestamp')
        except User.DoesNotExist:
            selected_user = None
            messages = []
    return render(request, 'messages_app/chat.html', {
        'users': users,
        'selected_user': selected_user,
        'messages': messages
    })

@login_required
def send_message(request):
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"send_message called with method: {request.method}")
    logger.info(f"Request user: {request.user.username}")
    logger.info(f"Request user authenticated: {request.user.is_authenticated}")
    logger.info(f"Request headers: {request.headers}")
    try:
        body_unicode = request.body.decode('utf-8')
        logger.info(f"Request body raw: {body_unicode}")
    except Exception as e:
        logger.error(f"Error decoding request body: {e}")
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            logger.info(f"send_message received data: {data}")
            receiver_username = data.get('receiver')
            content = data.get('content')
            if not receiver_username or not content:
                logger.warning("Missing receiver or content in send_message")
                return HttpResponseBadRequest('Missing receiver or content')
            try:
                receiver = User.objects.get(username=receiver_username)
            except User.DoesNotExist:
                logger.warning(f"Receiver does not exist: {receiver_username}")
                return HttpResponseBadRequest('Receiver does not exist')
            message = Message.objects.create(sender=request.user, receiver=receiver, content=content)
            logger.info(f"Message created: {message.id} by sender: {request.user.username}")
            return JsonResponse({
                'id': message.id,
                'sender': message.sender.username,
                'receiver': message.receiver.username,
                'content': message.content,
                'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            })
        except Exception as e:
            logger.error(f"Error in send_message: {e}")
            return HttpResponseBadRequest('Error processing request')
    else:
        logger.warning(f"Invalid request method: {request.method}")
    return HttpResponseBadRequest('Invalid request method')

@login_required
def get_messages(request, username):
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"get_messages called for user: {username} by {request.user.username}")
    try:
        other_user = User.objects.get(username=username)
    except User.DoesNotExist:
        logger.warning(f"User does not exist: {username}")
        return JsonResponse({'error': 'User does not exist'}, status=404)
    messages = Message.objects.filter(
        Q(sender=request.user, receiver=other_user) |
        Q(sender=other_user, receiver=request.user)
    ).order_by('timestamp')
    messages_data = [{
        'id': msg.id,
        'sender': msg.sender.username,
        'receiver': msg.receiver.username,
        'content': msg.content,
        'timestamp': msg.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for msg in messages]
    logger.info(f"Returning {len(messages_data)} messages")
    return JsonResponse({'messages': messages_data})
