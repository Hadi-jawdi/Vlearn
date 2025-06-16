from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('mettings_app.urls')),
    path('account/', include('account_app.urls')),
    path('messages/', include('messages_app.urls')),
]
