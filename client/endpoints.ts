
const host = 'http://127.0.0.1:50300';

export async function getWatchedVideos(ids: string[]): Promise<string[]> {
  const response = await fetch(`${host}/api/times`, {
    method: 'POST',
    body: JSON.stringify(ids),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const times: string[] = await response.json();

  return times;
}