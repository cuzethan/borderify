# Borderify

Frontend (React + Vite) and backend (FastAPI) in a single repo.

## Structure

- **frontend/** — React + TypeScript + Vite app. Run with `npm run dev` from repo root or from `frontend/`.
- **backend/** — FastAPI app. See `backend/README.md` for setup and running.

## Quick start

**Frontend**

```bash
npm run dev
```

(Or `cd frontend && npm run dev`. Frontend runs at http://localhost:5173.)

**Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at http://127.0.0.1:8000. API docs at http://127.0.0.1:8000/docs.
