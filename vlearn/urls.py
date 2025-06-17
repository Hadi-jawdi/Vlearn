from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(('mettings_app.urls', 'mettings_app'), namespace='mettings_app')),
    path('account/', include('account_app.urls')),
    path('messages/', include('messages_app.urls')),
    path('home/', include(('home_app.urls', 'home_app'), namespace='home_app')),
]
