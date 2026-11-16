
export type DbSchema = {
  videoTimes: VideoTimes,
};

export type VideoTimes = {
  [id: string]: VideoObj,
};

export type VideoObj = {
  duration: number | null,
  time: number,
  timestamp: number,
};