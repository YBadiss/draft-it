import asyncio
from fastapi import FastAPI, Request, WebSocket
from fastapi.staticfiles import StaticFiles
import os

from app.logic import draft_service
from app.models import CreateDraft, Draft, PlayerPick

app = FastAPI()

if os.environ.get("DEPLOYMENT_ENV") in ["PROD"]:
    import redis
    app.state.env = "PROD"
    app.state.redis = redis.Redis(
        host=os.environ["REDIS_HOST"],
        port=os.environ["REDIS_PORT"],
        password=os.environ["REDIS_PASSWORD"],
    )
else:
    import fakeredis
    app.state.env = "TEST"
    server = fakeredis.FakeServer()
    app.state.redis = fakeredis.FakeRedis(server=server)

class WebSocketManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, team_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[team_id] = websocket

    def disconnect(self, team_id: str):
        del self.active_connections[team_id]

    async def receive_message(self, team_id: str):
        print(f"Receiving message from team {team_id}")
        if websocket := self.active_connections.get(team_id):
            return await websocket.receive_json()
        else:
            print(f"No websocket found for team {team_id}")
            return None

    async def send_message(self, message: dict, team_id: str):
        print(f"Sending message team={team_id} type={message['type']}")
        if websocket := self.active_connections.get(team_id):
            await websocket.send_json(message)
        else:
            print(f"No websocket found for team {team_id}")


app.state.ws_manager = WebSocketManager()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.websocket("/ws/{team_id}")
async def websocket_endpoint(websocket: WebSocket, team_id: str):
    await app.state.ws_manager.connect(team_id, websocket)
    try:
        while True:
            await app.state.ws_manager.receive_message(team_id)
    except Exception:
        print(f"ws for {team_id} disconnected")
        app.state.ws_manager.disconnect(team_id)

@app.get("/_health")
async def health_check(request: Request):
    request.app.state.redis.set("_health_check", "OK")
    assert request.app.state.redis.get("_health_check") == b"OK"
    return {"status": "OK", "env": request.app.state.env}

@app.get("/ws")
async def get_ws_url(request: Request):
    ws_url = os.environ.get("WS_URL", "ws://localhost:8080")
    return {
        "url": ws_url,
        "connections": list(request.app.state.ws_manager.active_connections.keys())
    }

@app.post("/draft")
async def create_new_draft(create_draft_data: CreateDraft, request: Request) -> Draft:
    draft = draft_service.create_new_draft(competition_id=create_draft_data.competitionId, redis=request.app.state.redis)
    return draft_service.clean_draft_for_users(draft)

@app.get("/draft")
async def get_draft(teamId: str, request: Request) -> Draft:
    draft = draft_service.get_draft(team_id=teamId, redis=request.app.state.redis)
    return draft_service.clean_draft_for_users(draft)

@app.post("/draft/pick")
async def select_player(playerPick: PlayerPick, request: Request) -> Draft:
    draft = draft_service.pick_player(team_id=playerPick.teamId, player_id=playerPick.playerId, redis=request.app.state.redis)
    clean_draft = draft_service.clean_draft_for_users(draft)
    await asyncio.gather(*[
        request.app.state.ws_manager.send_message({"type": "draftUpdate", "content": clean_draft.model_dump_json()}, team.id)
        for team in clean_draft.teams
    ])
    return clean_draft
