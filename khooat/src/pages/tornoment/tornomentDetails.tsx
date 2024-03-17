import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useState, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export function TornomentDetails() {
    // get the id from the url
    const { id } = useParams();

    // useEffect(() => {
    //     const ws = new WebSocket("ws://localhost:8000/ws" );

    //     ws.send('sdad')
    //     ws.onmessage = function(event) {
    //         debugger
    //         console.log(event)
    //         // var messages = document.getElementById('messages')
    //         // var message = document.createElement('li')
    //         // var content = document.createTextNode(event.data)
    //         // message.appendChild(content)
    //         // messages.appendChild(message)
    //     };
    //     return () => {
    //         ws.close()
    //     }
    // }, [])
    return <main>

        <h1>{id}</h1>
        <WebSocketDemo />
    </main>
}




export const WebSocketDemo = () => {
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState('ws://localhost:8000/ws');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  const handleClickChangeSocketUrl = useCallback(
    () => setSocketUrl('ws://localhost:8000/ws/sendMessage'),
    []
  );

  const handleClickSendMessage = useCallback(() => sendMessage('Hello'), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <button onClick={handleClickChangeSocketUrl}>
        Click Me to change Socket Url
      </button>
      <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send 'Hello'
      </button>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      <ul>
        {messageHistory.map((message, idx) => (
          <span key={idx}>{message ? message.data : null}</span>
        ))}
      </ul>
    </div>
  );
};

