# MedRoster AI

MedRoster AI is a patient-centric surgery scheduling prototype built to
explore how hospital rosters can be generated based on patient needs
rather than doctor availability.

This project is not built as a commercial hospital system. It is a
thoughtful engineering prototype designed to demonstrate API-first
architecture, scheduling logic, and extensible AI system design. The
focus is on clarity, structure, and practical system thinking.

------------------------------------------------------------------------

## Why This Project Exists

Most hospital scheduling systems operate in a doctor-first manner:

Doctor availability → Fit patient cases into available slots.

This prototype explores a different perspective:

Patient urgency and specialization requirements → Allocate doctors
dynamically.

The goal is to simulate a fairer and more demand-aware scheduling
strategy using structured APIs and deterministic optimization logic.

------------------------------------------------------------------------

## Core Principles

-   API-first design
-   Clean and versioned REST endpoints
-   Structured request and response contracts
-   Extensible scheduling engine
-   Presentation-ready architecture
-   Designed for clarity over complexity

------------------------------------------------------------------------

## System Architecture

Client (Postman or Frontend) ↓ FastAPI Backend (API Layer) ↓ Scheduling
Engine (Core Logic) ↓ Database (Doctors, Patients, Surgeries,
Assignments)

The scheduling engine is modular and built to support future expansion
into AI-driven explanation and predictive modeling.

------------------------------------------------------------------------

## Current Capabilities (Phase 1)

-   Versioned API structure (/api/v1/)
-   Doctor management endpoints
-   Patient registration endpoints
-   Surgery creation endpoints
-   Schedule generation endpoint
-   Urgency-based prioritization
-   Specialization matching
-   Load balancing between doctors
-   OpenAPI (Swagger) documentation
-   Designed for Postman workflow testing

------------------------------------------------------------------------

## API Overview

Doctors POST /api/v1/doctors GET /api/v1/doctors GET
/api/v1/doctors/{id}

Patients POST /api/v1/patients GET /api/v1/patients

Surgeries POST /api/v1/surgeries GET /api/v1/surgeries

Scheduling Engine POST /api/v1/schedule/run GET /api/v1/schedule/result

------------------------------------------------------------------------

## Scheduling Logic (Phase 1)

The current implementation follows a structured deterministic approach:

1.  Surgeries are sorted by urgency (high to low).
2.  Eligible doctors are filtered by required specialization.
3.  The least-loaded eligible doctor is assigned.
4.  Overload conflicts are prevented.
5.  Structured JSON output is returned.

Future versions may introduce fatigue scoring, emergency
re-optimization, AI-based explanation layers, and predictive demand
modeling.

------------------------------------------------------------------------

## Technology Stack

Backend: FastAPI\
ORM: SQLAlchemy\
Database: SQLite (development)\
Documentation: OpenAPI (Swagger)\
API Testing: Postman\
Planned CI: Newman\
Planned Deployment: Render or Fly.io

------------------------------------------------------------------------

## Local Setup

Clone the repository:

git clone `<repo_url>`{=html} cd medroster-ai

Create and activate virtual environment:

python -m venv venv venv`\Scripts`{=tex}`\activate   `{=tex}(Windows) \#
source venv/bin/activate (Mac/Linux)

Install dependencies:

pip install -r requirements.txt

Run the application:

uvicorn app.main:app --reload

Access API documentation at:

http://127.0.0.1:8000/docs

------------------------------------------------------------------------

## Roadmap

Phase 1 Deterministic urgency-based scheduling API-first structure

Phase 2 AI explanation layer Fatigue scoring Emergency rebalancing

Phase 3 Predictive surgery demand modeling Multi-objective optimization
Adaptive scheduling strategies

------------------------------------------------------------------------

## Disclaimer

This is a research and architectural prototype. It is not intended for
clinical or real-world medical deployment.

------------------------------------------------------------------------

## Author

Built as an independent systems engineering project focused on
healthcare optimization and API-driven architecture.
