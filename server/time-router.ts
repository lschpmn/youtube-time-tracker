import { Router } from 'express';
import { Server, Socket } from 'socket.io';
import db from './lib/db';
import { log } from './lib/utils';

const router = Router();

export function timeRouterSocketConnection(socket: Socket, io: Server) {
  socket.on('get', (id: string, callback: (t: number) => void) => {
    const time = db.getTime(id);
    log(`get video id: ${id} - time(sec): ${time}`);
    callback(time);
  });

  socket.on('set', (id: string, time: number) => {
    if (time) {
      log(`set video id: ${id} - time(sec): ${time}`);
      db.setTime(id, time);
      io.emit('time-update', id, time);
    } else {
      log(`unable to set video id: ${id}, time undefined`);
    }
  });
}

router.get('/time/:id', (req, res) => {
  const id = req.params.id;
  const time = db.getTime(id);
  log(`get video id: ${id} - time(sec): ${time}`, req);

  res.status(200).send(time);
});

router.post('/time/:id', (req, res) => {
  const id = req.params.id;
  const time = req.body.time;
  if (time) {
    log(`set video id: ${id} - time(sec): ${time}`, req);
    db.setTime(id, +req.body.time);
  } else {
    log(`unable to set video id: ${id}, time undefined`, req);
  }

  res.status(200).send();
});

router.post('/times', (req, res) => {
  const ids: string[] = req.body;
  log('got ids ' + JSON.stringify(ids));
  const returnIds = ids.filter(id => !!db.getTime(id));
  log('sending back ids: ' + JSON.stringify(returnIds));

  res.status(200).send(returnIds);
});

export default router;