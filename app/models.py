from typing import Annotated, Optional
from pydantic import BaseModel
from pydantic.functional_validators import BeforeValidator
import re
from enum import Enum

class Position(str, Enum):
    GK = "GK"
    LB = "LB"
    CB = "CB"
    RB = "RB"
    DM = "DM"
    LM = "LM"
    CM = "CM"
    RM = "RM"
    AM = "AM"
    LW = "LW"
    CF = "CF"
    RW = "RW"

    @staticmethod
    def map_position(raw_position: str) -> "Position":
        if raw_position in [e.value for e in Position]:
            return raw_position
        match raw_position:
            case "Goalkeeper":
                return Position.GK
            case "Left-Back":
                return Position.LB
            case "Centre-Back":
                return Position.CB
            case "Right-Back":
                return Position.RB
            case "Defensive Midfield":
                return Position.DM
            case "Left Midfield":
                return Position.LM
            case "Central Midfield":
                return Position.CM
            case "Right Midfield":
                return Position.RM
            case "Attacking Midfield":
                return Position.AM
            case "Left Winger":
                return Position.LW
            case "Centre-Forward":
                return Position.CF
            case "Right Winger":
                return Position.RW
            case _:
                raise Exception(f"Unknown raw position: {raw_position}")

def parse_amount(amount: str | int) -> int:
    if isinstance(amount, int):
        return amount
    
    if amount == "-":
        return 0.0
    multipliers = {"bn": 10**9, "m": 10**6, "k": 10**3}
    try:
        unit, amount, multiplier = re.match(f"(.*?)([\d\.]+)({'|'.join(list(multipliers.keys()))})", amount).groups()
        return int(float(amount) * multipliers[multiplier])
    except Exception as e:
        print(f"Error '{e}' for '{amount}'")
        raise

Amount = Annotated[int, BeforeValidator(parse_amount)]
PositionAnnotation = Annotated[Position, BeforeValidator(Position.map_position)]

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
    position: PositionAnnotation
    clubName: str
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
    credit: int
    numberBoosters: int
    picksPerBooster: int

    @property
    def players(self) -> list[Player]:
        return [
            player
            for club in self.clubs
            for player in club.players
        ]

    @property
    def available_players(self) -> list[Player]:
        return [
            player
            for player in self.players
            if not player.status and player.marketValue
        ]
    
class Booster(BaseModel):
    numberOfPicks: int
    players: list[Player]

class Team(BaseModel):
    id: str
    players: list[Player]

class DraftState(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETE = "COMPLETE"

class Draft(BaseModel):
    id: str
    state: DraftState
    competitionId: str
    competitionName: str
    credit: int
    boosters: list[Booster]
    currentBoosterId: int
    teams: list[Team]
    teamSize: int = 11

    @property
    def players(self) -> list[Player]:
        return [
            player
            for booster in self.boosters
            for player in booster.players
        ]


class CreateDraft(BaseModel):
    competitionId: str

class PlayerPick(BaseModel):
    teamId: str
    playerId: int
