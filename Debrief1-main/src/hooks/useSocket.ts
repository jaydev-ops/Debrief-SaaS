import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../services/config';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('debrief_token');
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'], // Allow fallback for corporate proxy compatibility
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 10
      });
    }

    setSocket(socketInstance);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    if (socketInstance.connected) setConnected(true);

    return () => {
      socketInstance?.off('connect', onConnect);
      socketInstance?.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket, connected };
};
