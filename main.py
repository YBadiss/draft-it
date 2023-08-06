from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from data import fetch_competition
from logic import get_draft
from models import Draft

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/draft")
async def root() -> Draft:
    competition = fetch_competition(competition_name="ligue1")
    draft = get_draft(competition=competition, number_boosters=2)
    print([(player.name, player.marketValue) for booster in draft.boosters for player in booster.players])
    return draft
