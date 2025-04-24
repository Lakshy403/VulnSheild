from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import scan_api

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_api.router)
