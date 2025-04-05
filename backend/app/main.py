from fastapi import FastAPI
from app.routes import router
from app.services.scheduler import start_scheduler

app = FastAPI(title="ReflectIn Backend")

# Include API routes
app.include_router(router)

# Start the scheduler for follow-ups
start_scheduler()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
