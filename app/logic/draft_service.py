from uuid import uuid4

from redis import Redis

from app.data import store
from app.data.competition import get_competition
from app.models import DraftState, Player, Draft, Booster, Team
import math
import random


def create_new_draft(competition_id: str, redis: Redis) -> Draft:
    competition = get_competition(competition_id=competition_id)
    draft = Draft(
        id=str(uuid4()),
        state=DraftState.IN_PROGRESS,
        competitionId=competition.id,
        competitionName=competition.name,
        credit=competition.credit,
        boosters=[],
        currentBoosterId=0,
        teams=[
            Team(id=str(uuid4()), players=[]),
            Team(id=str(uuid4()), players=[]),
        ],
    )

    # generate boosters
    available_players = _sort_players(
        [p for p in competition.available_players if p not in draft.players]
    )
    team_size = draft.teamSize
    for _ in range(competition.numberBoosters):
        number_of_picks = min(team_size, competition.picksPerBooster)
        team_size -= number_of_picks
        booster = _make_booster(available_players, number_of_picks=number_of_picks)
        draft.boosters.append(booster)
        available_players = [p for p in available_players if p not in booster.players]

    store.set_draft(draft=draft, redis=redis)
    return draft

def get_draft(team_id: str, redis: Redis) -> Draft:
    return store.get_draft_by_team(team_id=team_id, redis=redis)

def pick_player(team_id: str, player_id: int, redis: Redis) -> Draft:
    draft = store.get_draft_by_team(team_id=team_id, redis=redis)
    # Will fail if the player was already picked
    assert all(player_id not in [p.id for p in t.players] for t in draft.teams), "Player already picked"
    # Will fail if the player is not in this booster
    player = next(p for p in draft.boosters[draft.currentBoosterId].players if p.id == player_id)
    
    team = next(t for t in draft.teams if t.id == team_id)
    team.players = _sort_players([player] + team.players)

    teamSizeUpToCurrentBooster = sum(booster.numberOfPicks for booster in draft.boosters[:draft.currentBoosterId+1])
    if all(len(t.players) == teamSizeUpToCurrentBooster for t in draft.teams):
        draft.currentBoosterId += 1
        if draft.currentBoosterId >= len(draft.boosters):
            draft.state = DraftState.COMPLETE
    store.set_draft(draft=draft, redis=redis)
    return draft

def clean_draft_for_users(draft: Draft) -> Draft:
    # Ensure only the currently visible boosters are sent to the users
    draft.boosters = [
        booster
        if i <= draft.currentBoosterId
        else Booster(numberOfPicks=booster.numberOfPicks, players=[])
        for (i, booster) in enumerate(draft.boosters)
    ]
    return draft

def _make_booster(available_players: list[Player], number_of_picks: int) -> Booster:
    number_players = len(available_players)

    selected_players = []
    distribution = [
        (2, 5.0),
        (3, 10.0),
        (10, 30.0),
        (5, 60.0),
        (2, 100.0),
    ]
    min_percentile = 0.0
    for (sample_size, max_percentile) in distribution:
        player_pool: list[Player] = available_players[
            math.floor(number_players * min_percentile / 100):math.floor(number_players * max_percentile / 100)
        ]
        selected_players.extend(random.sample(player_pool, sample_size))
        min_percentile = max_percentile
    return Booster(
        players=_sort_players(selected_players),
        numberOfPicks=number_of_picks,
    )


def _sort_players(players: list[Player]) -> list[Player]:
    return sorted(players, key=lambda p: p.marketValue, reverse=True)