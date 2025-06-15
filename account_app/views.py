from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from .forms import UserRegisterForm, UserLoginForm

# Create your views here.

def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'New account created: {user.username}')
            return redirect('home_app:home')  # Redirect to a home page after successful registration
        else:
            for msg in form.error_messages:
                messages.error(request, form.error_messages[msg])
    else:
        form = UserRegisterForm()
    return render(request, 'account_app/register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        form = UserLoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.info(request, f'You are now logged in as {username}')
                return redirect('home_app:home') # Redirect to a home page after successful login
            else:
                messages.error(request, 'Invalid username or password.')
        else:
            messages.error(request, 'Invalid username or password.')
    form = UserLoginForm()
    return render(request, 'account_app/login.html', {'form': form})


# logging out user 
def user_logout(request):
    logout(request)
    messages.info(request, 'You have successfully logged out.')
    return redirect('home_app:home') # Redirect to a home page after successful logout
