# EnergyWise AI

AI-based household electricity usage analyzer (Emerging Technologies Course Work 2026).

## Features
- Daily usage input and history charts
- Next-month usage and bill prediction (AI: Ridge Regression, scikit-learn)
- Usage pattern analysis (Big Data Analytics: pandas)
- High-usage alert and energy-saving recommendations
- Estimated electricity cost calculator

## Tech stack
React (Vite) + Chart.js, FastAPI, pandas, scikit-learn, SQLite, Docker, nginx, AWS (EC2, S3)

## Run with Docker
    docker compose up --build

Open http://localhost

## Run locally
Backend: cd backend, create a venv, pip install -r requirements.txt, python -m uvicorn app.main:app --reload --port 8000

Frontend: cd frontend, npm install, npm run dev

## Model validation
Time-based 80/20 split: MAE 0.915 kWh, MAPE 11.27% (synthetic sample data).
