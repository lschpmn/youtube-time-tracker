import { Router } from 'express';
import db from './lib/db';
import { log } from './lib/utils';

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

export default router;