#!/bin/bash
# Start FastAPI server using uvicorn
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
