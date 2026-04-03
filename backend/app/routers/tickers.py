from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/api/tickers", tags=["tickers"])


class TickerCreate(BaseModel):
    symbol: str
    company_name: str | None = None
    sector: str | None = None


class TickerOut(BaseModel):
    id: int
    symbol: str
    company_name: str | None = None
    sector: str | None = None
    is_active: bool

    model_config = {"from_attributes": True}


@router.get("", response_model=list[TickerOut])
def list_tickers(db: Session = Depends(get_db)):
    return db.query(models.Ticker).filter(models.Ticker.is_active == True).all()


@router.post("", response_model=TickerOut, status_code=201)
def create_ticker(payload: TickerCreate, db: Session = Depends(get_db)):
    sym = payload.symbol.upper()
    if db.query(models.Ticker).filter(models.Ticker.symbol == sym).first():
        raise HTTPException(status_code=409, detail=f"Ticker {sym} already exists")
    ticker = models.Ticker(
        symbol=sym,
        company_name=payload.company_name,
        sector=payload.sector,
    )
    db.add(ticker)
    db.commit()
    db.refresh(ticker)
    return ticker
