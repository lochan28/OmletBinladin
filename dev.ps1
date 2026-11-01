# Starts backend (:8000) and frontend (:5173) in separate windows
Start-Process powershell -ArgumentList '-NoExit','-Command','cd backend; .\.venv\Scripts\uvicorn app.main:app --reload --port 8000'
Start-Process powershell -ArgumentList '-NoExit','-Command','cd frontend; npm run dev'
