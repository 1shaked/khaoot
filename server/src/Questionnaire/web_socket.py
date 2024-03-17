from fastapi import APIRouter, FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
ws_router = APIRouter()

clients: Dict[str, WebSocket] = {}
rooms: Dict[str, List[str]] = {}  # Room name to list of client IDs

async def broadcast_to_room(room_name: str, message: str):
    """Send a message to all clients in a room."""
    if room_name in rooms:
        for client_id in rooms[room_name]:
            if client_id in clients:
                await clients[client_id].send_text(message)

@ws_router.websocket("/sendMessage")
async def send_message(websocket: WebSocket, client_id: str):
    await websocket.accept()
    clients[client_id] = websocket
    try:
        while True:
            data = await websocket.receive_text()
            # Assuming the message format is "room_name:message"
            room_name, message = data.split(":", 1)
            await broadcast_to_room(room_name, message)
    except WebSocketDisconnect:
        del clients[client_id]

@ws_router.websocket("/joinGroup")
async def join_group(websocket: WebSocket, client_id: str, room_name: str):
    await websocket.accept()
    import pdb; pdb.set_trace()
    if room_name not in rooms:
        rooms[room_name] = []
    rooms[room_name].append(client_id)
    await websocket.send_text(f"Joined room {room_name}")
    await websocket.close()



@ws_router.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        # import pdb; pdb.set_trace()
        data = json.loads(data)
        command = data.get("type")
        message = data.get("message")
        if command == "ECHO":
            response = f"Echo: {message}"
        elif command == "REVERSE":
            response = message[::-1]
        else:
            response = "Unknown command"
        
        await websocket.send_text(response)