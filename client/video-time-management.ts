

class VideoTimeManagement {
  timeout: NodeJS.Timeout = null

  constructor() {
    this.watch(1000);
  }

  private watch(time: number) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      console.log('f')
    }, time);
  }

}