from models import Player, Competition, Draft, Booster
import math
import random


def get_draft(competition: Competition, number_boosters: int) -> Draft:
    draft = Draft(
        competition_id=competition.id,
        competition_name=competition.name,
        boosters=[],
    )
    available_players = _sort_players(competition.available_players)
    for _ in range(number_boosters):
        booster = _get_booster(available_players)
        draft.boosters.append(booster)
        available_players = [p for p in available_players if p not in booster.players]
    return draft

def _get_booster(available_players: list[Player]) -> Booster:
    number_players = len(available_players)

    selected_players = []
    distribution = [
        (1, 5.0),
        (2, 10.0),
        (5, 30.0),
        (10, 60.0),
        (5, 100.0),
    ]
    min_percentile = 0.0
    for (number_of_picks, max_percentile) in distribution:
        player_pool: list[Player] = available_players[
            math.floor(number_players * min_percentile / 100):math.floor(number_players * max_percentile / 100)
        ]
        print(f"Player pool: ({min_percentile}, {max_percentile}) -> select {number_of_picks} from {len(player_pool)} players")
        selected_players.extend(random.sample(player_pool, number_of_picks))
        min_percentile = max_percentile
    return Booster(players=_sort_players(selected_players))

def _sort_players(players: list[Player]) -> list[Player]:
    return sorted(players, key=lambda p: p.marketValue, reverse=True)