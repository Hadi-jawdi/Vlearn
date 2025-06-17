import json
from channels.generic.websocket import AsyncWebsocketConsumer

class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'room_{self.room_code}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        # If the message is a join type, broadcast new-peer to others
        if data.get('type') == 'join':
            # Broadcast new-peer message to all except sender
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'signal_message',
                    'message': {
                        'type': 'new-peer',
                        'peer_id': data.get('peer_id'),
                        'sender_channel': self.channel_name
                    }
                }
            )
        else:
            # Broadcast the message to the room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'signal_message',
                    'message': data
                }
            )

    # Receive message from room group
    async def signal_message(self, event):
        message = event['message']
        # Avoid sending the new-peer message back to the sender
        if message.get('type') == 'new-peer' and message.get('sender_channel') == self.channel_name:
            return

        # Remove sender_channel before sending to client
        if 'sender_channel' in message:
            del message['sender_channel']

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))
