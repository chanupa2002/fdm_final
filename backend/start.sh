#!/bin/bash

# Install dependencies (optional if Railway already installs requirements)
pip install -r requirements.txt

# Start FastAPI with uvicorn, using PORT env variable from Railway
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
