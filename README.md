# MedRoster API

MedRoster is a hospital staff scheduling backend built with FastAPI and
SQLAlchemy.

## Features

-   JWT Authentication (OAuth2 Password Flow)
-   Department Management
-   Staff Management
-   Shift Management
-   Shift Assignments
-   SQLite (Development Database)

------------------------------------------------------------------------

## Tech Stack

-   FastAPI
-   SQLAlchemy
-   SQLite
-   JWT (python-jose)
-   Uvicorn

------------------------------------------------------------------------

## Project Structure

medroster/ │ ├── app/ │ ├── main.py │ ├── database.py │ ├── models/ │
├── schemas/ │ ├── routers/ │ └── dependencies/ │ ├── medroster.db ├──
requirements.txt └── README.md

------------------------------------------------------------------------

## Setup Instructions

### 1. Create Virtual Environment

python -m venv venv

Activate:

Windows: venv`\Scripts`{=tex}`\activate`{=tex}

Mac/Linux: source venv/bin/activate

------------------------------------------------------------------------

### 2. Install Dependencies

pip install -r requirements.txt

------------------------------------------------------------------------

### 3. Run Server

uvicorn app.main:app --reload

Server URL: http://127.0.0.1:8000

Swagger Documentation: http://127.0.0.1:8000/docs

------------------------------------------------------------------------

## Authentication Flow

1.  Register → POST /auth/register
2.  Login → POST /auth/login
3.  Click Authorize in Swagger
4.  Access protected endpoints

------------------------------------------------------------------------

## Testing Flow Order

1.  Create Admin User
2.  Authorize
3.  Create Department
4.  Create User
5.  Create Shift
6.  Create Assignment

------------------------------------------------------------------------

## Known Issue (Under Investigation)

-   Department endpoint returning 401 after login (Likely token
    validation logic in get_current_user)

------------------------------------------------------------------------

## Future Improvements

-   Role-Based Access Control
-   Conflict Detection for Shift Assignments
-   PostgreSQL Production Database
-   Dockerization
-   CI/CD Pipeline

------------------------------------------------------------------------

Author: MedRoster Infrastructure Development
