import cors from 'cors';
import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server } from 'socket.io';
import { getCommandLineArguments, log } from './lib/utils';
import timeRouter, { timeRouterSocketConnection } from './time-router';

const { PORT } = getCommandLineArguments();

const app = express();
const server = createHttpServer(app);

const io = new Server(server);

io.on('connection', socket => {
  timeRouterSocketConnection(socket);
});

app.use(cors());
app.use(express.json());

app.use('/api', timeRouter);

app.use((err, req, res, next) => {
  log(err);
  log(err.stack);
  res.status(500).send(err);
});

server.listen(PORT, () => log(`started redirect server at http://localhost:${PORT}`));
