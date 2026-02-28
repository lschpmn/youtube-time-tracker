import cors from 'cors';
import express from 'express';
import { createServer as createHttpServer } from 'http';
import db from './lib/db';
import { getCommandLineArguments, log } from './lib/utils';

const { PORT } = getCommandLineArguments();

const app = express();
const server = createHttpServer(app);

app.use(cors());
app.use(express.json());

app.get('/api/time/:id', (req, res) => {
  const id = req.params.id;
  const time = db.getTime(id);
  log(`get video id: ${id} - time(sec): ${time}`, req);

  res.status(200).send(time);
});

app.post('/api/time/:id', (req, res) => {
  const id = req.params.id;
  const time = req.body.time;
  if (time) {
    log(`set video id: ${id} - time(sec): ${time}`, req);
    db.setTime(id, +req.body.time);
  }

  res.status(200).send();
});

app.delete('/api/time/:id', (req, res) => {
  const id = req.params.id;
  log(`delete video id: ${id}`, req);
  db.deleteTime(id);
  res.status(200).send();
});

app.use((err, req, res, next) => {
  log(err);
  log(err.stack);
  res.status(500).send(err);
});

server.listen(PORT, () => log(`started redirect server at http://localhost:${PORT}`));
