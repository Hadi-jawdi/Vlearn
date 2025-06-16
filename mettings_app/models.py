from django.db import models
import uuid

class Room(models.Model):
    name = models.CharField(max_length=255)
    code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return f"{self.name} ({self.code})"
