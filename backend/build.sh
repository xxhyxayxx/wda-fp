#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate

# Create superuser
python manage.py newsuperuser

# Ensure media directory exists and copy default files
mkdir -p /media/profile_images/  # Create media/profile_images directory
cp backend/media/profile_images/default_profile.png /media/profile_images/
