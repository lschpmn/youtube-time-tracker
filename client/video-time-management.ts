

class VideoTimeManagement {
  timeout: NodeJS.Timeout = null

  constructor() {
    this.watch();
  }

  private watch() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      console.log('f')
    }, 1000);
  }

}