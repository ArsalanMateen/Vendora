import { io } from 'socket.io-client';
import { useEffect } from 'react';

const socket = io(import.meta.env.VITE_SOCKET_URL || undefined, { autoConnect: false });
let consumers = 0;
let disconnectTimer;
export function useAuctionSocket() {
  useEffect(() => {
    clearTimeout(disconnectTimer);
    consumers += 1;
    if (!socket.connected) socket.connect();

    return () => {
      consumers -= 1;
      // A route transition and StrictMode replay may mount a new consumer immediately.
      disconnectTimer = setTimeout(() => {
        if (!consumers) socket.disconnect();
      }, 0);
    };
  }, []);

  return socket;
}
export default socket;
