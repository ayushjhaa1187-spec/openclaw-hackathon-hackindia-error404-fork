import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL_ROOT || 'http://localhost:3001', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('🛡️ Admin: Connected to Nexus Socket Hub');
    });
  }
  return socket;
};

export { socket };
