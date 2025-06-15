from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField()

    class Meta(UserCreationForm.Meta):
        model = UserCreationForm.Meta.model
        fields = UserCreationForm.Meta.fields + ('email',)

class UserLoginForm(AuthenticationForm):
    class Meta:
        model = AuthenticationForm
        fields = ['username', 'password'] 