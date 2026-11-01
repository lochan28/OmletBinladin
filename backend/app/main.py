import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlmodel import SQLModel, Field, Session, create_engine, select

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL", "sqlite:///./app.db"))


class Item(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str


app = FastAPI(title="Hackathon API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def startup():
    SQLModel.metadata.create_all(engine)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/items")
def list_items():
    with Session(engine) as s:
        return s.exec(select(Item)).all()


@app.post("/api/items")
def create_item(item: Item):
    with Session(engine) as s:
        s.add(item); s.commit(); s.refresh(item)
        return item
