import cors from 'cors';
import express from 'express';
import { createServer as createHttpServer } from 'http';
import { getCommandLineArguments, log } from './lib/utils';
import timeRouter from './time-router';

const { PORT } = getCommandLineArguments();

const app = express();
const server = createHttpServer(app);

app.use(cors());
app.use(express.json());

app.use('/api', timeRouter);

app.use((err, req, res, next) => {
  log(err);
  log(err.stack);
  res.status(500).send(err);
});

server.listen(PORT, () => log(`started redirect server at http://localhost:${PORT}`));
