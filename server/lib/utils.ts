import dayjs from 'dayjs';
import { Request } from 'express';

const PROD_PORT = 50305;

export const getCommandLineArguments = (): { PORT: number, DEVELOP: boolean } => {
  const { argv } = process;
  const portIndex = argv.indexOf('--port');
  const port = portIndex > -1 ? +argv[portIndex + 1] : 0;

  return {
    PORT: port || PROD_PORT,
    DEVELOP: argv.includes('--development'),
  };
};

export const log = (message: string, req: Request = null) => {
  const timeStr = dayjs().format('hh:mm:ss.SSSA ddd MM/DD/YY');
  let requestStr = '';

  if (req) {
    const ip = (req.header('x-real-ip') || req.ip).replace('::ffff:', '');
    requestStr = `- ip:${ip} - url:${req.url}`;
  }

  console.log(`${timeStr} ${requestStr} - ${message}`);
}
