from typing import Annotated, Optional
from pydantic import BaseModel
from pydantic.functional_validators import BeforeValidator
import re

def parse_amount(amount: str) -> float:
    if amount == "-":
        return 0.0
    multipliers = {"bn": 10**9, "m": 10**6, "k": 10**3}
    try:
        unit, amount, multiplier = re.match(f"(.*?)([\d\.]+)({'|'.join(list(multipliers.keys()))})", amount).groups()
        return float(amount) * multipliers[multiplier]
    except Exception as e:
        print(f"Error '{e}' for '{amount}'")
        raise

Amount = Annotated[int, BeforeValidator(parse_amount)]

class Player(BaseModel):
    age: int
    contract: str
    dateOfBirth: str
    foot: str
    height: str
    id: int
    joinedOn: str
    marketValue: Amount
    name: str
    nationality: list[str]
    position: str
    status: Optional[str] = None

class Club(BaseModel):
    id: int
    name: str
    players: list[Player]

class Competition(BaseModel):
    clubs: list[Club]
    continent: str
    country: str
    id: str
    marketValue: Amount
    name: str

    @property
    def available_players(self) -> list[Player]:
        return [
            player
            for club in self.clubs
            for player in club.players
            if not player.status
        ]
    
class Booster(BaseModel):
    players: list[Player]

class Draft(BaseModel):
    competition_id: str
    competition_name: str
    boosters: list[Booster]
