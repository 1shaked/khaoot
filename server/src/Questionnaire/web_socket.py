from fastapi import APIRouter, FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

from prisma import Prisma
ws_router = APIRouter()

clients: Dict[str, WebSocket] = {}
active_websockets = set()

rooms: Dict[str, set[WebSocket]] = {}  # Room name to list of client IDs

async def broadcast_to_room(room_name: str, message: str):
    """Send a message to all clients in a room."""
    for client_id in rooms[room_name]:
        try:
            await clients[client_id].send_text(message)
        except Exception as e:
            print(e)
            pass
        # if client_id in active_websockets:
        # await clients[client_id].send_text(message)

    # if room_name in rooms:
    #     for client_id in rooms[room_name]:
    #         if client_id in clients:
    #             await clients[client_id].send_text(message)

# @ws_router.websocket("/sendMessage")
# async def send_message(websocket: WebSocket, client_id: str):
#     await websocket.accept()
#     clients[client_id] = websocket
#     try:
#         while True:
#             data = await websocket.receive_text()
#             # Assuming the message format is "room_name:message"
#             room_name, message = data.split(":", 1)
#             await broadcast_to_room(room_name, message)
#     except WebSocketDisconnect:
#         del clients[client_id]

# @ws_router.websocket("/joinGroup")
# async def join_group(websocket: WebSocket, client_id: str, room_name: str):
#     await websocket.accept()
#     if room_name not in rooms:
#         rooms[room_name] = []
#     rooms[room_name].append(client_id)
#     await websocket.send_text(f"Joined room {room_name}")
#     await websocket.close()



# async def broadcast(message: str):
#     for websocket in active_websockets:
#         await websocket.send_text(message)



@ws_router.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            
            data = json.loads(data)
            command = data.get("type")
            message = data.get("message")
            if command == "ECHO":
                response = f"Echo: {message}"

            
            elif command == "JOIN_TOR":
                # get the tornoment id and add the user to the tornoment
                tor_id = data.get('id')
                # add this user to the room
                if tor_id not in rooms:
                    rooms[tor_id] = set()
                rooms[tor_id].add(websocket)


            elif command == "SEND_ANSWER":
                # get the tornoment id and add the user to the tornoment
                tor_id = data.get('id')
                # get answer and question
                answer = data.get('answer')
                question = data.get('question')
                # get the user email
                user_email = data.get('user_email')
                # save the answer in the database
                db = Prisma()
                db.connect()

                db.answertoquestionintor.create(data={'answer_id': answer, 'question_id': question, 'tornoment_id': tor_id, 'user_email': user_email})
                db.disconnect()
                # add this user to the room
                if tor_id not in rooms:
                    rooms[tor_id] = set()
                rooms[tor_id].add(websocket)
                # get the message and send it to the room
                await broadcast_to_room(tor_id, message)
            

            elif command == "REVERSE":
                response = message[::-1]
            elif command == "BROADCAST":
                # Use the broadcast function to send a message to all connected clients
                # await broadcast(f"Broadcast: {message}")
                continue  # Skip adding this message to the current websocket
            else:
                response = "Unknown command"
            print(data, command, message, )
            
            await websocket.send_text(response)
    except WebSocketDisconnect:
        active_websockets.remove(websocket)
    finally:
        active_websockets.remove(websocket)





# @ws_router.websocket("/")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     while True:
#         data = await websocket.receive_text()
#         data = json.loads(data)
#         command = data.get("type")
#         message = data.get("message")
#         if command == "ECHO":
#             response = f"Echo: {message}"
#         elif command == "REVERSE":
#             response = message[::-1]
#         else:
#             response = "Unknown command"
#         print(data, command, message, response)
        
#         await websocket.send_text(response)