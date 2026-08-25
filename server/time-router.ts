import { Router } from 'express';
import { Socket } from 'socket.io';
import db from './lib/db';
import { log } from './lib/utils';


export function timeRouterSocketConnection(socket: Socket) {
  socket.on('get' as ActionTypes, (id: string, callback: (t: number) => void) => {
    getTime(id, callback);
  });

  socket.on('set' as ActionTypes, (id: string, time: number) => {
    setTime(id, time);
  });
}

function getTime(id: string, callback: (time: number) => void) {
  const time = db.getTime(id);
  log(`getTime for ${id}, time(sec) ${time}`);
  callback(time);
}

function setTime(id: string, time: number) {
  log(`setTime ${id}, time(sec) ${time}`);
  db.setTime(id, time);
}

// Old Router

const router = Router();

router.delete('/time/:id', (req, res) => {
  const id = req.params.id;
  log(`delete video id: ${id}`, req);
  db.deleteTime(id);
  res.status(200).send();
});

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
  log('got ids ' + JSON.stringify(ids))
  const returnIds = ids.filter(id => !!db.getTime(id));
  log('sending back ids: ' + JSON.stringify(returnIds));

  res.status(200).send(returnIds);
});

export default router;