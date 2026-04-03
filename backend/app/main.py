from fastapi import FastAPI
from app.routers import tickers

app = FastAPI(title="Quant Scope API", version="0.1.0")

app.include_router(tickers.router)


@app.get("/health")
def health():
    return {"status": "ok"}
