import getIncrementalPort from 'get-incremental-port';
import nodemon from 'nodemon';
import { join } from 'path';
import process from 'process';

const DEVELOP_PORT = 50300;
const PORT = process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : DEVELOP_PORT;

(async function () {
  const port = await getIncrementalPort(PORT);

  nodemon({
    watch: [join(__dirname, 'server')],
    script: join(__dirname, 'server/index.ts'),
    args: [
      '--port', port.toString(),
      '--development',
      '--max-old-space-size', '16384', //sets process memory limit to 16GB
    ],
  });

  nodemon.on('restart', (files: []) =>
    files?.length > 0
      ? console.log(`nodemon: restarting because of files ${files.join(', ')}`)
      : console.log('nodemon: restarting because of user input'),
  );

  nodemon.on('crash', () => console.log('nodemon: app crash'));

})().catch(err => {
  console.log('Server Error');
  console.log(err);
  process.exit();
});
