# wda-fp: e-learning platform

A full-stack e-learning platform with real-time notifications and messaging. Django REST back-end with WebSockets (Channels) and background jobs (Celery, Redis); React front-end with Redux Toolkit. Around 250 automated tests across both sides.

Final project for *Advanced Web Development*, BSc Computer Science (Data Science), University of London (Goldsmiths). Single developer.

## Features

**Users and roles**
- Email-based custom user model with `teacher` and `student` roles, profile image, password change
- Token authentication (Django REST Framework), logout with token revocation
- Role-scoped routes on the front-end (`PublicRoute`, `PrivateRoute`, `StudentRoute`, `TeacherRoute`) and an `IsTeacher` permission class on the API
- User search and user detail pages

**Courses**
- Teachers create, edit, publish and delete courses and modules; upload course files with file-type validation and batch create/update/delete
- Students enrol, complete modules, and see per-course progress (percentage kept on the enrolment)
- Teachers see enrolled students and can block a student from a course with a reason
- One feedback (rating and comment) per enrolment

**Real-time and asynchronous**
- WebSocket notifications and one-to-one messaging via Django Channels with a Redis channel layer
- Celery tasks for creating notifications (single user, bulk, or all users), backed by Redis and `django-celery-results`
- A `post_save` signal on `Course` fans out a "new course released" notification through Celery
- Notification and message read state, conversation list

**Operations**
- Swagger and ReDoc API docs (`/swagger/`, `/redoc/`), `/health/` endpoint
- Docker Compose with `backend` (Daphne ASGI), `redis`, `celery` and `frontend` services
- `render.yaml` and `build.sh` for deployment to Render, with a management command that creates the superuser from environment variables

## Tests

- Back-end: about 160 tests with `pytest-django` covering models, serializers, views and signals (`backend/accounts/tests/`, `backend/courses/tests/`). Test settings switch Channels to an in-memory layer.
- Front-end: about 90 tests with `vitest` and Testing Library covering components, route guards and every Redux slice.

```bash
# back-end
cd backend && pytest

# front-end
cd frontend/app && npm test
```

## Stack

| Layer | Technology |
| --- | --- |
| API | Python 3, Django 4.2, Django REST Framework, django-filter, drf-yasg |
| Real-time | Django Channels, Daphne, channels_redis |
| Background jobs | Celery, Redis, django-celery-results |
| Front-end | React 18, Vite, Redux Toolkit, react-router 6, CSS Modules |
| Testing | pytest, pytest-django, vitest, @testing-library/react |
| Infrastructure | Docker Compose, Render |

## Running locally

Create a `.env` in the repository root (used by the backend and celery services) and `frontend/app/.env` (see `frontend/app/src/utils/apiClient.js` for the variables the client reads). Then:

```bash
docker compose up --build
```

- Front-end: http://localhost:5173
- API: http://localhost:8000, docs at http://localhost:8000/swagger/

## Structure

```
backend/
  accounts/   Users, auth, notifications, messaging, WebSocket consumers, Celery tasks
  courses/    Courses, modules, files, enrolments, progress, feedback, permissions, signals
  backend/    Settings, ASGI/WSGI, Celery app, root URLs
frontend/app/src/
  components/ Pages and UI components (with co-located tests)
  features/   Redux slices: user, course, enrollment, module, moduleProgress, file, feedback, message, notification
  routes/     Route guards
  utils/      API client, message and notification WebSocket services
```

## Known issues

- `requirements.txt` was generated with `pip freeze` and includes packages the project does not use (Flask, dash, plotly, pandas). It should be trimmed.
- Code comments are partly in Japanese.
- Database is SQLite; a production deployment would move to PostgreSQL.
- `CORS_ALLOW_ALL_ORIGINS` is on and logging is at DEBUG level; both should be tightened for production.

## Notes

Coursework, kept as submitted apart from this README, moving the secret key to an environment variable and removing a stray Redis dump file. It is here to show how I structure, test and containerise a full-stack application with real-time and asynchronous parts.
