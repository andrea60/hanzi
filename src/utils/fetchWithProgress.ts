export const fetchWithProgress = async <T>(
  url: string,
  onProgress: (p: number) => void
) => {
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch ${url}`);
  }

  const contentLength = response.headers.get("Content-Length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (value) {
      received += value.length;
      result += decoder.decode(value, { stream: true });

      if (total) {
        onProgress(received / total);
      }
    }
  }

  // Final decode for any remaining bytes
  result += decoder.decode();

  // Parse the full JSON string
  try {
    const json = JSON.parse(result) as T;
    return json;
  } catch (err) {
    throw "Invalid JSON:" + err;
  }
};
