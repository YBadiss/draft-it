from redis import Redis
from app.models import Draft

def set_draft(draft: Draft, redis: Redis):
    redis.set(f"draft:{draft.id}", draft.model_dump_json())
    for team in draft.teams:
        redis.set(f"team:{team.id}", draft.id)

def get_draft_by_id(draft_id: str, redis: Redis):
    draft_json = redis.get(f"draft:{draft_id}").decode("utf-8")
    return Draft.model_validate_json(draft_json)

def get_draft_by_team(team_id: str, redis: Redis):
    draft_id = redis.get(f"team:{team_id}").decode("utf-8")
    return get_draft_by_id(draft_id=draft_id, redis=redis)
