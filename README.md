Vlearn 

## Project Overview
Vlearn is a Django-based web application designed to facilitate meetings, messaging, and user account management. It leverages Django Channels and Redis to provide real-time chat functionality within meetings and messaging features.

## Features
- **Meetings App (`mettings_app`)**: Main landing page and meetings management with real-time chat.
- **Account App (`account_app`)**: User registration, login, and account management.
- **Messages App (`messages_app`)**: Messaging and chat features for users.
- **Home App (`home_app`)**: User dashboard or home page.
- **Chat App (`chat_app`)**: Real-time chat functionality integrated with meetings.
- **Django Channels & Redis**: Asynchronous support for real-time features.


### Prerequisites
- Python 3.8+
- Redis server running locally on default port 6379
- Virtualenv (recommended)



## Configuration

- The project uses SQLite as the default database.
- Redis must be running locally for Django Channels to work properly.
- Settings are located in `vlearn/settings.py`.
- Templates are stored in the global `templates/` directory and app-specific template folders.
- Static files are served from the `static/` directory.



## Running Tests

Each app contains tests in their respective `tests.py` files. Run all tests with:

```bash
python manage.py test
```
Made with Love!
