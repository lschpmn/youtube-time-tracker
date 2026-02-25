import express from 'express';
import cors from 'cors';
import { createServer as createHttpServer } from 'http';
import { getCommandLineArguments, log } from './lib/utils';

const { PORT } = getCommandLineArguments();

const app = express();
const server = createHttpServer(app);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  // x-real-ip = ip address from nginx
  const ip = (req.header('x-real-ip') || req.ip).replace('::ffff:', '');
  log(`ip:${ip} - url:${req.url}`);
  next();
});

app.get('/api/time/:id', (req, res) => {
  res.status(200).send('38');
});

app.post('/api/time/:id', (req, res) => {
  console.log(req.body);

  res.status(200).send('good job!');
});

app.use((err, req, res, next) => {
  log(err);
  log(err.stack);
  res.status(500).send(err);
});

server.listen(PORT, () => log(`started redirect server at http://localhost:${PORT}`));
