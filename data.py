from models import Competition
import requests
import json

BASE_URL = "https://transfermarkt-api.vercel.app"

def fetch_competition(competition_name: str) -> Competition:
    with open(f"{competition_name}.json", "r") as f:
        competition = json.load(f)

    if not competition:
        competition = requests.get(f"{BASE_URL}/competitions/search/{competition_name}").json()[0]

    try:
        if "clubs" not in competition:
            competition["clubs"] = requests.get(f"{BASE_URL}/competitions/{competition['id']}/clubs").json()["clubs"]
        
        for club in competition["clubs"]:
            if "players" not in club:
                print(f"Fetching players for '{club['name']}'")
                club["players"] = requests.get(f"{BASE_URL}/clubs/{club['id']}/players").json()["players"]
    except Exception as e:
        print(f"Failed with {e}")

    with open(f"{competition_name}.json", "w+") as f:
        json.dump(competition, f, indent=2, sort_keys=True)
    return Competition(**competition)
