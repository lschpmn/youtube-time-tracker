import { getTime, setTime } from './socket';
import { getVideo, getVideoId } from './utils';

class VideoTimeManagement {
  firstLoad: boolean = true;
  videoId: string | null = null;
  timeout: NodeJS.Timeout = null;

  constructor() {
    this.watch(5);
  }

  watch(time: number) {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {

      try {
        if (this.firstLoad) this.firstLoadCall().catch(console.error);
        else this.regularCall();

      } catch (err) {
        console.error(err);
      } finally {
        this.watch(1000);
      }

    }, time);
  }

  private async firstLoadCall() {
    this.videoId = getVideoId();
    const video = getVideo();

    if (!video) return;

    const time = await getTime(this.videoId);

    if (time) {
      video.currentTime = time;
      this.firstLoad = false;
    }
  }

  private regularCall() {
    const video = getVideo();
    const videoId = getVideoId();

    if (videoId === this.videoId && video.currentTime > 5) {
      setTime(videoId, video.currentTime);
    }
  }

}

export default new VideoTimeManagement();