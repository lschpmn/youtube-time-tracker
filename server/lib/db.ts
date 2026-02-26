import { exists, read, writeAsync } from 'fs-jetpack';
import { throttle } from 'lodash';
import { join } from 'path';
import { DbSchema } from '../types';

const DB_PATH = join(__dirname, '../..', 'bin', 'db.json');

class DB {
  data: DbSchema;

  constructor() {
    if (exists(DB_PATH)) {
      this.data = read(DB_PATH, 'json');
    } else {
      this.data = {
        videoTimes: {},
      };

      this.save();
    }
  }

  deleteTime = (id: string) => {
    delete this.data.videoTimes[id];
    this.save();
  };

  getTime = (id: string) => this.data.videoTimes[id]?.time;

  setTime = (id: string, time: number) => {
    this.data.videoTimes[id] = {
      time,
      timestamp: Date.now(),
    };
    this.save();
  };

  private save = throttle(() => {
    writeAsync(DB_PATH, this.data, { atomic: true })
      .catch(err => {
        console.error('Error writing db!');
        console.log(err);
        this.save();
      });
  }, 2000);
}

export default new DB();