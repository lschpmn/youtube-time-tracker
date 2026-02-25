import dayjs from 'dayjs';

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

export const log = (message: string) =>
  console.log(`${dayjs().format('hh:mm:ss.SSSA ddd MM/DD/YY')} - ${message}`);
