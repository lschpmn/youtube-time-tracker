import cors from 'cors';
import express from 'express';
import { createServer as createHttpServer } from 'http';
import { getCommandLineArguments, log } from './lib/utils';
import timeRouter, { timeRouterSocketConnection } from './time-router';

const { PORT } = getCommandLineArguments();

const app = express();
const server = createHttpServer(app);

import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: true,
  }
});

io.on("connection", (socket) => {
  log(`new connection: ${socket.id}`);
  timeRouterSocketConnection(socket, io);

  socket.on('disconnect', () => {
    log(`disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());

app.use('/api', timeRouter);

app.use('/', (req, res) => {
  log(req.url);
  res.status(404).send();
});

app.use((err, req, res, next) => {
  log(err);
  log(err.stack);
  res.status(500).send(err);
});

server.listen(PORT, () => log(`started redirect server at http://localhost:${PORT}`));
