# Vlearn Django Project

## Project Overview
Vlearn is a Django-based web application designed to facilitate meetings, messaging, and user account management. It leverages Django Channels and Redis to provide real-time chat functionality within meetings and messaging features. The project is structured into multiple apps, each responsible for a specific domain of the application.

## Features
- **Meetings App (`mettings_app`)**: Main landing page and meetings management with real-time chat.
- **Account App (`account_app`)**: User registration, login, and account management.
- **Messages App (`messages_app`)**: Messaging and chat features for users.
- **Home App (`home_app`)**: User dashboard or home page.
- **Chat App (`chat_app`)**: Real-time chat functionality integrated with meetings.
- **Django Channels & Redis**: Asynchronous support for real-time features.

## Installation

### Prerequisites
- Python 3.8+
- Redis server running locally on default port 6379
- Virtualenv (recommended)

### Setup Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Vlearn
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate   # On Windows
   source venv/bin/activate  # On macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install django channels channels-redis
   ```

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser (optional, for admin access):
   ```bash
   python manage.py createsuperuser
   ```

## Configuration

- The project uses SQLite as the default database.
- Redis must be running locally for Django Channels to work properly.
- Settings are located in `vlearn/settings.py`.
- Templates are stored in the global `templates/` directory and app-specific template folders.
- Static files are served from the `static/` directory.

## Running the Development Server

Start the Django development server with:

```bash
python manage.py runserver
```

Access the application at `http://127.0.0.1:8000/`.

## Project Structure Overview

```
Vlearn/
├── account_app/          # User account management app
├── chat_app/             # Real-time chat app for meetings
├── home_app/             # User dashboard/home app
├── mettings_app/         # Meetings management and main landing app
├── messages_app/         # Messaging and chat app
├── templates/            # Global templates directory
├── static/               # Static files (CSS, JS, images)
├── vlearn/               # Main Django project settings and URLs
├── manage.py             # Django management script
├── db.sqlite3            # SQLite database file
└── README.md             # This file
```

## Running Tests

Each app contains tests in their respective `tests.py` files. Run all tests with:

```bash
python manage.py test
```

## Static Files and Templates

- Static files are located in each app's `static/` folder and the global `static/` directory.
- Templates are organized globally under `templates/` and within each app's `templates/` folder.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
