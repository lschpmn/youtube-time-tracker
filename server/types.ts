
export type DbSchema = {
  videoTimes: VideoTimes,
};

export type VideoTimes = {
  [id: string]: {
    time: number,
    timestamp: number,
  },
};