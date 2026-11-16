
export type DbSchema = {
  videoTimes: VideoTimes,
};

export type VideoTimes = {
  [id: string]: {
    duration: number | null,
    time: number,
    timestamp: number,
  },
};