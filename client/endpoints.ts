
const host = 'http://127.0.0.1:50300';

export async function getWatchedVideos(ids: string[]): Promise<string[]> {
  if (!ids.length) return ids;

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

export async function getTime(id: string): Promise<number> {
  const response = await fetch(`${host}/api/time/${id}`);
  const time = await response.text();

  return +time;
}

export async function postTime(id: string, time: number): Promise<void> {
  await fetch(`${host}/api/time/${id}`, {
    method: 'POST',
    body: `{ "time": ${time} }`,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
