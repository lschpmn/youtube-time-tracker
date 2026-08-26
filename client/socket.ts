import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:50300');

export async function getTime(id: string): Promise<number> {
  return socket.emitWithAck('get' as ActionTypes, id);
}

export function setTime(id: string, time: number) {
  socket.emit('set' as ActionTypes, id, time);
}
