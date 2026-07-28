

export function getVideoId(): string {
  const url = new URL(window.location.href);
  return url.searchParams.get('v');
}

export function log(message: string) {
  console.log('see me, ' + message);
}