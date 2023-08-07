from app.models import Competition
import requests
import json

def get_competition(competition_id: str) -> Competition:
    competition_id = competition_id.lower()
    with open(f"app/{competition_id}.json", "r") as f:
        competition = json.load(f)
    return _load_model(competition=competition)

def update_competition(competition_id: str) -> Competition:
    competition_id = competition_id.lower()
    with open(f"app/{competition_id}.json", "r") as f:
        competition = json.load(f)

    BASE_URL = "https://transfermarkt-api.vercel.app"
    competition = {
        **competition,
        **requests.get(f"{BASE_URL}/competitions/search/{competition_id}").json()[0]
    }

    try:
        competition["clubs"] = requests.get(f"{BASE_URL}/competitions/{competition['id']}/clubs").json()["clubs"]
        
        for club in competition["clubs"]:
            print(f"Fetching players for '{club['name']}'")
            club["players"] = requests.get(f"{BASE_URL}/clubs/{club['id']}/players").json()["players"]
    except Exception as e:
        print(f"Failed with {e}")

    with open(f"app/{competition_id}.json", "w+") as f:
        json.dump(competition, f, indent=2, sort_keys=True)
    
    return _load_model(competition=competition)

def _load_model(competition: dict) -> Competition:
    for club in competition["clubs"]:
        for player in club["players"]:
            player["clubName"] = club["name"]
    return Competition(**competition)
